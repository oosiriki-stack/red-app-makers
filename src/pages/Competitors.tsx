import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

export default function Competitors() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Analyse Concurrentielle</h1>
            <p className="text-muted-foreground">Benchmarking et radar d'influence</p>
          </div>
        </div>

        <Card className="glass-card rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-2">L'analyse concurrentielle sera disponible une fois que vous aurez suffisamment de données de mentions.</p>
          <p className="text-xs text-muted-foreground">Configurez votre surveillance dans les paramètres pour commencer.</p>
        </Card>
      </div>
    </AnimatedPage>
  );
}
