import { useEffect, useMemo, useState } from "react";
import { Map as PigeonMap, Marker, Overlay } from "pigeon-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Lookup of common cities (lat/lng). Côte d'Ivoire focused, plus a few world capitals.
const CITY_COORDS: Record<string, [number, number]> = {
  // Côte d'Ivoire
  "abidjan": [5.345317, -4.024429],
  "yamoussoukro": [6.827623, -5.289343],
  "bouake": [7.689999, -5.030011],
  "bouaké": [7.689999, -5.030011],
  "san pedro": [4.748333, -6.636111],
  "korhogo": [9.458099, -5.629391],
  "daloa": [6.877221, -6.450079],
  "man": [7.412124, -7.553811],
  "cocody": [5.354667, -3.987013],
  "yopougon": [5.336667, -4.085],
  "plateau": [5.323333, -4.022222],
  "marcory": [5.288333, -3.991111],
  "treichville": [5.298056, -4.005278],
  "abobo": [5.42, -4.0],
  "adjamé": [5.358056, -4.020556],
  "adjame": [5.358056, -4.020556],
  "koumassi": [5.296944, -3.953889],
  "port-bouët": [5.260833, -3.926389],
  "port-bouet": [5.260833, -3.926389],
  // Régional
  "dakar": [14.7167, -17.4677],
  "lomé": [6.1319, 1.2228],
  "lome": [6.1319, 1.2228],
  "cotonou": [6.3703, 2.3912],
  "ouagadougou": [12.3714, -1.5197],
  "bamako": [12.6392, -8.0029],
  "accra": [5.6037, -0.187],
  "lagos": [6.5244, 3.3792],
  // Monde
  "paris": [48.8566, 2.3522],
  "londres": [51.5074, -0.1278],
  "london": [51.5074, -0.1278],
  "new york": [40.7128, -74.006],
  "montréal": [45.5017, -73.5673],
  "montreal": [45.5017, -73.5673],
  "bruxelles": [50.8503, 4.3517],
  "geneve": [46.2044, 6.1432],
  "genève": [46.2044, 6.1432],
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  "côte d'ivoire": [7.54, -5.55],
  "cote d'ivoire": [7.54, -5.55],
  "ivory coast": [7.54, -5.55],
  "france": [46.6, 2.4],
  "sénégal": [14.5, -14.5],
  "senegal": [14.5, -14.5],
  "togo": [8.6, 0.8],
  "bénin": [9.3, 2.3],
  "benin": [9.3, 2.3],
  "burkina faso": [12.2, -1.6],
  "mali": [17.6, -4.0],
  "ghana": [7.95, -1.03],
  "nigeria": [9.08, 8.68],
  "canada": [56.1, -106.3],
  "belgique": [50.5, 4.5],
  "suisse": [46.8, 8.2],
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function resolveCoord(city?: string | null, country?: string | null, commune?: string | null, fallback?: string | null): [number, number] | null {
  const tries: string[] = [];
  if (commune) tries.push(commune);
  if (city) tries.push(city);
  // Free-form fallback like "Cocody, Abidjan"
  if (fallback) fallback.split(/[,;/]/).forEach((p) => tries.push(p));
  for (const t of tries) {
    const k = normalize(t);
    if (CITY_COORDS[k]) return CITY_COORDS[k];
  }
  if (country) {
    const k = normalize(country);
    if (COUNTRY_COORDS[k]) return COUNTRY_COORDS[k];
  }
  return null;
}

type Point = {
  key: string;
  lat: number;
  lng: number;
  label: string;
  count: number;
  users: string[];
};

export function UsageMap() {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Point | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: settings }] = await Promise.all([
        supabase.from("profiles").select("id, name, location"),
        supabase.from("monitoring_settings").select("user_id, country, city, commune"),
      ]);
      const sMap = new Map<string, any>();
      (settings ?? []).forEach((s: any) => sMap.set(s.user_id, s));

      const bucket = new Map<string, Point>();
      (profiles ?? []).forEach((p: any) => {
        const s = sMap.get(p.id);
        const coord = resolveCoord(s?.city, s?.country, s?.commune, p.location);
        if (!coord) return;
        const label = [s?.commune, s?.city, s?.country].filter(Boolean).join(", ") || p.location || "—";
        const k = `${coord[0].toFixed(2)}_${coord[1].toFixed(2)}`;
        const existing = bucket.get(k);
        if (existing) {
          existing.count += 1;
          existing.users.push(p.name || "Utilisateur");
        } else {
          bucket.set(k, { key: k, lat: coord[0], lng: coord[1], label, count: 1, users: [p.name || "Utilisateur"] });
        }
      });
      setPoints(Array.from(bucket.values()));
      setLoading(false);
    })();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return [7.54, -5.55]; // Côte d'Ivoire par défaut
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return [lat, lng];
  }, [points]);

  const totalLocated = points.reduce((s, p) => s + p.count, 0);
  const maxCount = Math.max(1, ...points.map((p) => p.count));

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Carte d'utilisation</span>
          <Badge variant="outline" className="rounded-lg">{totalLocated} utilisateur{totalLocated > 1 ? "s" : ""} géolocalisé{totalLocated > 1 ? "s" : ""} · {points.length} ville{points.length > 1 ? "s" : ""}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border" style={{ height: 380 }}>
            <PigeonMap defaultCenter={center} defaultZoom={points.length > 0 ? 4 : 5}>
              {points.map((p) => {
                const size = Math.round(18 + (p.count / maxCount) * 26);
                return (
                  <Marker key={p.key} width={size} anchor={[p.lat, p.lng]} color="#E5A100" onClick={() => setActive(p)} />
                );
              })}
              {active && (
                <Overlay anchor={[active.lat, active.lng]} offset={[100, 30]}>
                  <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-3 text-xs w-56">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{active.label}</p>
                      <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground">×</button>
                    </div>
                    <p className="text-muted-foreground">{active.count} utilisateur{active.count > 1 ? "s" : ""}</p>
                    <ul className="mt-1 space-y-0.5 max-h-24 overflow-auto">
                      {active.users.slice(0, 8).map((u, i) => <li key={i} className="truncate">• {u}</li>)}
                    </ul>
                  </div>
                </Overlay>
              )}
            </Map>
          </div>
        )}
        {!loading && points.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">Aucune localisation enregistrée. Les utilisateurs apparaîtront ici une fois leur ville renseignée dans Paramètres → Surveillance.</p>
        )}
      </CardContent>
    </Card>
  );
}
