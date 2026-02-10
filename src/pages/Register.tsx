import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AtSign } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <AtSign className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            <span className="text-gradient-red">@robase</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Créez votre compte</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prénom</Label>
              <Input placeholder="Jean" />
            </div>
            <div>
              <Label>Nom</Label>
              <Input placeholder="Dupont" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="jean@entreprise.com" />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <Label>Rôle</Label>
            <Select defaultValue="analyst">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyste</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">Créer mon compte</Button>
          <p className="text-sm text-center text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
