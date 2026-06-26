import { useMemo, useState } from "react";
import { Map as PigeonMap, Marker, Overlay } from "pigeon-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Users } from "lucide-react";

// 100 utilisateurs fictifs répartis dans toute l'Afrique avec une concentration en Côte d'Ivoire.
// Visible uniquement par le super administrateur (à embarquer dans la page Super Admin).

type FakeUser = { name: string; city: string; country: string; lat: number; lng: number; plan: string; brand: string };

const CITIES: { city: string; country: string; lat: number; lng: number; weight: number }[] = [
  // Côte d'Ivoire — concentration forte
  { city: "Abidjan", country: "Côte d'Ivoire", lat: 5.345, lng: -4.024, weight: 18 },
  { city: "Cocody", country: "Côte d'Ivoire", lat: 5.354, lng: -3.987, weight: 6 },
  { city: "Yopougon", country: "Côte d'Ivoire", lat: 5.336, lng: -4.085, weight: 5 },
  { city: "Plateau", country: "Côte d'Ivoire", lat: 5.323, lng: -4.022, weight: 4 },
  { city: "Marcory", country: "Côte d'Ivoire", lat: 5.288, lng: -3.991, weight: 3 },
  { city: "Treichville", country: "Côte d'Ivoire", lat: 5.298, lng: -4.005, weight: 3 },
  { city: "Abobo", country: "Côte d'Ivoire", lat: 5.42, lng: -4.0, weight: 3 },
  { city: "Yamoussoukro", country: "Côte d'Ivoire", lat: 6.827, lng: -5.289, weight: 4 },
  { city: "Bouaké", country: "Côte d'Ivoire", lat: 7.69, lng: -5.03, weight: 3 },
  { city: "San-Pédro", country: "Côte d'Ivoire", lat: 4.748, lng: -6.636, weight: 2 },
  { city: "Korhogo", country: "Côte d'Ivoire", lat: 9.458, lng: -5.629, weight: 2 },
  { city: "Daloa", country: "Côte d'Ivoire", lat: 6.877, lng: -6.45, weight: 2 },
  // Reste Afrique de l'Ouest
  { city: "Dakar", country: "Sénégal", lat: 14.716, lng: -17.467, weight: 4 },
  { city: "Thiès", country: "Sénégal", lat: 14.79, lng: -16.92, weight: 1 },
  { city: "Bamako", country: "Mali", lat: 12.639, lng: -8.002, weight: 3 },
  { city: "Ouagadougou", country: "Burkina Faso", lat: 12.371, lng: -1.519, weight: 3 },
  { city: "Bobo-Dioulasso", country: "Burkina Faso", lat: 11.18, lng: -4.29, weight: 1 },
  { city: "Cotonou", country: "Bénin", lat: 6.37, lng: 2.391, weight: 2 },
  { city: "Lomé", country: "Togo", lat: 6.131, lng: 1.222, weight: 2 },
  { city: "Accra", country: "Ghana", lat: 5.603, lng: -0.187, weight: 3 },
  { city: "Kumasi", country: "Ghana", lat: 6.69, lng: -1.624, weight: 1 },
  { city: "Lagos", country: "Nigeria", lat: 6.524, lng: 3.379, weight: 4 },
  { city: "Abuja", country: "Nigeria", lat: 9.057, lng: 7.495, weight: 2 },
  { city: "Conakry", country: "Guinée", lat: 9.641, lng: -13.578, weight: 1 },
  // Afrique centrale
  { city: "Yaoundé", country: "Cameroun", lat: 3.848, lng: 11.502, weight: 2 },
  { city: "Douala", country: "Cameroun", lat: 4.05, lng: 9.7, weight: 2 },
  { city: "Libreville", country: "Gabon", lat: 0.416, lng: 9.467, weight: 1 },
  { city: "Brazzaville", country: "Congo", lat: -4.263, lng: 15.242, weight: 1 },
  { city: "Kinshasa", country: "RDC", lat: -4.441, lng: 15.266, weight: 2 },
  // Maghreb
  { city: "Casablanca", country: "Maroc", lat: 33.572, lng: -7.589, weight: 2 },
  { city: "Rabat", country: "Maroc", lat: 34.02, lng: -6.84, weight: 1 },
  { city: "Tunis", country: "Tunisie", lat: 36.806, lng: 10.181, weight: 1 },
  { city: "Alger", country: "Algérie", lat: 36.737, lng: 3.087, weight: 1 },
  // Afrique de l'Est & Australe
  { city: "Nairobi", country: "Kenya", lat: -1.286, lng: 36.817, weight: 2 },
  { city: "Addis-Abeba", country: "Éthiopie", lat: 9.03, lng: 38.74, weight: 1 },
  { city: "Kigali", country: "Rwanda", lat: -1.95, lng: 30.058, weight: 1 },
  { city: "Le Cap", country: "Afrique du Sud", lat: -33.92, lng: 18.42, weight: 1 },
  { city: "Johannesburg", country: "Afrique du Sud", lat: -26.204, lng: 28.045, weight: 1 },
];

const FIRSTS = ["Awa","Kofi","Marie","Jean","Fatou","Ibrahim","Linda","David","Sophie","Marc","Aïcha","Yann","Chloé","Moussa","Élodie","Karim","Sarah","Paul","Nadia","Olivier","Mariam","Cheikh","Aminata","Ousmane","Bintou","Modou","Khadija","Lamine","Rokhaya","Babacar"];
const LASTS = ["Diallo","Koné","Traoré","N'Guessan","Ouattara","Sow","Sangaré","Diop","Ndiaye","Fall","Mbaye","Cissé","Touré","Camara","Bakayoko","Yao","Konan","Asante","Mensah","Bamba","Coulibaly","Doumbia","Adjé","Aka","Kouassi"];
const BRANDS = ["Orange CI","MTN","Moov Africa","Wave","Société Générale CI","Ecobank","Air Côte d'Ivoire","Foxtrot","Coris Bank","NSIA","Petro Ivoire","Carrefour Market","Jumia","Glovo","Yango"];
const PLANS = ["trial","starter","pro","enterprise"];

function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const USERS: FakeUser[] = (() => {
  const rng = seedRand(424242);
  const list: FakeUser[] = [];
  const pool: typeof CITIES = [];
  CITIES.forEach((c) => { for (let i = 0; i < c.weight; i++) pool.push(c); });
  for (let i = 0; i < 100; i++) {
    const c = pool[Math.floor(rng() * pool.length)];
    const jitter = () => (rng() - 0.5) * 0.18;
    list.push({
      name: `${FIRSTS[Math.floor(rng() * FIRSTS.length)]} ${LASTS[Math.floor(rng() * LASTS.length)]}`,
      city: c.city,
      country: c.country,
      lat: c.lat + jitter(),
      lng: c.lng + jitter(),
      plan: PLANS[Math.floor(rng() * PLANS.length)],
      brand: BRANDS[Math.floor(rng() * BRANDS.length)],
    });
  }
  return list;
})();

export function FakeUsersAdminMap() {
  const [active, setActive] = useState<FakeUser | null>(null);
  const grouped = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number; city: string; country: string; users: FakeUser[] }>();
    USERS.forEach((u) => {
      const key = `${u.lat.toFixed(2)}_${u.lng.toFixed(2)}`;
      const ex = m.get(key);
      if (ex) ex.users.push(u);
      else m.set(key, { lat: u.lat, lng: u.lng, city: u.city, country: u.country, users: [u] });
    });
    return Array.from(m.values());
  }, []);
  const totalCI = USERS.filter((u) => u.country === "Côte d'Ivoire").length;
  const countries = new Set(USERS.map((u) => u.country)).size;
  const maxCount = Math.max(1, ...grouped.map((g) => g.users.length));

  return (
    <Card className="glass-card rounded-2xl border-primary/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Démo · Utilisateurs simulés (admin)</span>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="rounded-lg"><Users className="w-3 h-3 mr-1" />{USERS.length} comptes</Badge>
            <Badge variant="outline" className="rounded-lg"><MapPin className="w-3 h-3 mr-1" />{countries} pays</Badge>
            <Badge className="rounded-lg bg-primary/15 text-primary border-primary/30">🇨🇮 {totalCI} en Côte d'Ivoire</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">Vue interne réservée à la super-administration : 100 profils simulés répartis sur le continent africain pour visualiser le potentiel d'usage de la plateforme.</p>
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 420 }}>
          <PigeonMap defaultCenter={[7.54, -5.55]} defaultZoom={4}>
            {grouped.map((g) => {
              const size = Math.round(16 + (g.users.length / maxCount) * 28);
              return <Marker key={`${g.lat}_${g.lng}`} width={size} anchor={[g.lat, g.lng]} color="#E5A100" onClick={() => setActive(g.users[0])} />;
            })}
            {active && (
              <Overlay anchor={[active.lat, active.lng]} offset={[120, 30]}>
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-3 text-xs w-60">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{active.name}</p>
                    <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground">×</button>
                  </div>
                  <p className="text-muted-foreground">{active.city}, {active.country}</p>
                  <p className="mt-1">Marque suivie : <strong>{active.brand}</strong></p>
                  <p>Plan : <strong className="capitalize">{active.plan}</strong></p>
                </div>
              </Overlay>
            )}
          </PigeonMap>
        </div>
      </CardContent>
    </Card>
  );
}
