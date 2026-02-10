import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";

export default function Login() {
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
          <p className="text-sm text-muted-foreground">Connectez-vous à votre espace</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="admin@arobase.ai" />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Se connecter</Button>
          <p className="text-sm text-center text-muted-foreground">
            Pas de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline">S'inscrire</Link>
          </p>
          <p className="text-xs text-center text-muted-foreground">
            <Link to="/mfa" className="hover:underline">Authentification multifacteur</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
