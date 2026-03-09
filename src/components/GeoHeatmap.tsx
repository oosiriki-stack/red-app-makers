import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const regions = [
  { name: "Île-de-France", mentions: 890, row: 0, col: 2 },
  { name: "Hauts-de-France", mentions: 320, row: 0, col: 3 },
  { name: "Normandie", mentions: 180, row: 1, col: 1 },
  { name: "Bretagne", mentions: 210, row: 1, col: 0 },
  { name: "Pays de la Loire", mentions: 150, row: 2, col: 0 },
  { name: "Centre-Val de Loire", mentions: 120, row: 2, col: 2 },
  { name: "Grand Est", mentions: 280, row: 0, col: 4 },
  { name: "Bourgogne-FC", mentions: 95, row: 1, col: 3 },
  { name: "Nouvelle-Aquitaine", mentions: 240, row: 3, col: 0 },
  { name: "Auvergne-RA", mentions: 350, row: 2, col: 3 },
  { name: "Occitanie", mentions: 270, row: 3, col: 2 },
  { name: "Provence-Alpes-CA", mentions: 410, row: 3, col: 4 },
  { name: "Corse", mentions: 45, row: 4, col: 4 },
];

const maxMentions = Math.max(...regions.map((r) => r.mentions));

function getOpacity(mentions: number) {
  return 0.15 + (mentions / maxMentions) * 0.85;
}

export function GeoHeatmap() {
  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Répartition géographique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 25 }, (_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const region = regions.find((r) => r.row === row && r.col === col);
            if (!region) return <div key={i} className="aspect-square rounded" />;
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className="aspect-square rounded-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      backgroundColor: `hsl(45, 93%, 47%)`,
                      opacity: getOpacity(region.mentions),
                    }}
                  >
                    <span className="text-[9px] text-white font-medium leading-tight text-center px-0.5">
                      {region.name.substring(0, 3)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{region.name}</p>
                  <p className="text-xs">{region.mentions} mentions</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
