import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activityLog";

type ChannelKey = "sms" | "whatsapp" | "slack" | "teams" | "email";
type Row = { id?: string; channel: ChannelKey; target: string; enabled: boolean; verified: boolean; last_test_at?: string | null };

const DEFS: { key: ChannelKey; icon: string; targetKey: "phone" | "webhook" | "email" }[] = [
  { key: "sms", icon: "📱", targetKey: "phone" },
  { key: "whatsapp", icon: "💬", targetKey: "phone" },
  { key: "slack", icon: "💼", targetKey: "webhook" },
  { key: "teams", icon: "👥", targetKey: "webhook" },
  { key: "email", icon: "✉️", targetKey: "email" },
];

function validateTarget(channel: ChannelKey, target: string, t: (k: string) => string): string | null {
  const v = target.trim();
  if (!v) return t("channels.missingTarget");
  if (channel === "sms" || channel === "whatsapp") {
    if (!/^\+?[0-9\s\-()]{6,}$/.test(v)) return t("channels.invalidPhone");
  } else if (channel === "email") {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return t("channels.invalidEmail");
  } else if (channel === "slack") {
    if (!/^https:\/\/hooks\.slack\.com\//i.test(v)) return t("channels.invalidWebhook");
  } else if (channel === "teams") {
    if (!/^https:\/\/[^ ]+\.(webhook\.office\.com|logic\.azure\.com)\//i.test(v)) return t("channels.invalidWebhook");
  }
  return null;
}

export function ChannelsCard() {
  const { user } = useAuth();
  const { t } = useT();
  const [rows, setRows] = useState<Record<ChannelKey, Row>>(() =>
    Object.fromEntries(DEFS.map((d) => [d.key, { channel: d.key, target: "", enabled: false, verified: false }])) as any
  );
  const [profilePhone, setProfilePhone] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<ChannelKey | null>(null);
  const [saving, setSaving] = useState<ChannelKey | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ChannelKey, string>>>({});

  const userEmail = user?.email || "";

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: chs }, { data: prof }] = await Promise.all([
        supabase.from("notification_channels").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle(),
      ]);
      const phone = (prof as any)?.phone || "";
      setProfilePhone(phone);
      setRows((prev) => {
        const next = { ...prev };
        for (const d of DEFS) {
          const stored = (chs || []).find((c: any) => c.channel === d.key);
          const fallbackTarget = d.targetKey === "phone" ? phone : d.targetKey === "email" ? userEmail : "";
          next[d.key] = {
            id: stored?.id,
            channel: d.key,
            target: stored?.target || fallbackTarget || "",
            enabled: !!stored?.enabled,
            verified: !!stored?.verified,
            last_test_at: stored?.last_test_at,
          };
        }
        return next;
      });
      setLoading(false);
    })();
  }, [user, userEmail]);

  const update = (k: ChannelKey, patch: Partial<Row>) => {
    setRows((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
    if (patch.target !== undefined) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async (k: ChannelKey) => {
    if (!user) return;
    const r = rows[k];
    const err = r.enabled ? validateTarget(k, r.target, t) : null;
    if (err) {
      setErrors((e) => ({ ...e, [k]: err }));
      toast.error(err);
      return;
    }
    setSaving(k);
    const payload = { user_id: user.id, channel: k, target: r.target?.trim() || null, enabled: r.enabled };
    const { data, error } = await supabase
      .from("notification_channels")
      .upsert(payload, { onConflict: "user_id,channel" })
      .select()
      .single();
    setSaving(null);
    if (error) {
      toast.error(error.message);
      logActivity({ action: "channel.save", target: k, status: "error", metadata: { error: error.message } });
      return;
    }
    update(k, { id: (data as any).id });
    toast.success(t("channels.saved"), {
      description: r.enabled ? t("channels.enabledOn") : t("channels.disabled"),
    });
    logActivity({ action: "channel.save", target: k, status: "success", metadata: { enabled: r.enabled } });
  };

  const test = async (k: ChannelKey) => {
    const r = rows[k];
    const err = validateTarget(k, r.target, t);
    if (err) {
      setErrors((e) => ({ ...e, [k]: err }));
      toast.error(err);
      return;
    }
    setTesting(k);
    try {
      const { data, error } = await supabase.functions.invoke("send-channel-test", {
        body: { channel: k, target: r.target.trim() },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message || t("channels.networkError"));
      const simulated = (data as any)?.simulated;
      toast.success(simulated ? t("channels.simulatedOk") : t("channels.tested"));
      update(k, { verified: true, last_test_at: new Date().toISOString() });
      if (user) {
        await supabase.from("notification_channels").upsert(
          { user_id: user.id, channel: k, target: r.target.trim(), enabled: r.enabled, verified: true, last_test_at: new Date().toISOString() },
          { onConflict: "user_id,channel" }
        );
      }
      logActivity({ action: "channel.test", target: k, status: "success", metadata: { simulated: !!simulated } });
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      toast.error(`${t("channels.testFail")}: ${msg}`);
      logActivity({ action: "channel.test", target: k, status: "error", metadata: { error: msg } });
    } finally {
      setTesting(null);
    }
  };

  const hint = useMemo(() => !profilePhone, [profilePhone]);

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">{t("channels.title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("channels.desc")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {hint && (
          <p className="text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-2">
            {t("channels.profileHint")}
          </p>
        )}
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          DEFS.map((d) => {
            const r = rows[d.key];
            const targetLabel = t(`channels.target.${d.targetKey}`);
            const err = errors[d.key];
            return (
              <div key={d.key} className={`rounded-xl border p-3 space-y-2 transition-colors ${err ? "border-red-500/40 bg-red-500/5" : "border-border bg-muted/30"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {t(`channels.${d.key}`)}
                      {r.verified && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {r.last_test_at ? new Date(r.last_test_at).toLocaleDateString("fr-FR") : "✓"}
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{t(`channels.${d.key}Desc`)}</p>
                  </div>
                  <Switch checked={r.enabled} onCheckedChange={(v) => update(d.key, { enabled: v })} />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={r.target}
                    placeholder={targetLabel}
                    onChange={(e) => update(d.key, { target: e.target.value })}
                    className={`rounded-lg ${err ? "border-red-500/60" : ""}`}
                    aria-invalid={!!err}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg" disabled={testing === d.key || saving === d.key} onClick={() => test(d.key)}>
                      {testing === d.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" className="rounded-lg" disabled={saving === d.key || testing === d.key} onClick={() => save(d.key)}>
                      {saving === d.key ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />{t("channels.saving")}</> : t("channels.save")}
                    </Button>
                  </div>
                </div>
                {err && <p className="text-[11px] text-red-600 dark:text-red-400">{err}</p>}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
