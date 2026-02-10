import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { competitors, voiceShare, influencers } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

const sentimentBadge = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  neutral: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function Competitors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analyse Concurrentielle</h1>
        <p className="text-muted-foreground">Benchmarking et radar d'influence</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Part de voix digitale</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={voiceShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                  {voiceShare.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tableau comparatif</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead className="text-right">Mentions</TableHead>
                  <TableHead className="text-right">Sentiment</TableHead>
                  <TableHead className="text-right">Tendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">{c.mentions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{c.sentiment}%</TableCell>
                    <TableCell className="text-right">
                      <span className={`flex items-center justify-end gap-1 text-sm ${c.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                        {c.trend.startsWith("+") ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {c.trend}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Influenceurs clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {influencers.map((inf) => (
              <Card key={inf.name} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="text-xs">{inf.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inf.name}</p>
                    <p className="text-xs text-muted-foreground">{inf.platform} · {inf.followers}</p>
                  </div>
                  <Badge className={`text-xs border-0 ${sentimentBadge[inf.sentiment]}`}>{inf.engagement}%</Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
