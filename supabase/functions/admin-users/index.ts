import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    // Verify caller is admin / super_admin
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "super_admin");
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "list_emails") {
      // Page through all users (Supabase admin returns 1k max per page)
      const emails: Record<string, string> = {};
      let page = 1;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) return json({ error: error.message }, 500);
        for (const usr of data.users) emails[usr.id] = usr.email ?? "";
        if (data.users.length < 1000) break;
        page++;
        if (page > 20) break;
      }
      return json({ emails });
    }

    if (action === "reset_password") {
      const userId = body.user_id as string | undefined;
      let email = (body.email as string | undefined)?.trim();
      if (!email && userId) {
        const { data: target } = await admin.auth.admin.getUserById(userId);
        email = target?.user?.email ?? undefined;
      }
      if (!email) return json({ error: "Email introuvable pour cet utilisateur" }, 404);
      const redirectTo = body.redirect_to as string | undefined;
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, email });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? "Erreur" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
