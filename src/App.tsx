import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { DemoGate } from "@/components/DemoGate";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Mentions from "@/pages/Mentions";
import Alerts from "@/pages/Alerts";
import Competitors from "@/pages/Competitors";
import AIAssistant from "@/pages/AIAssistant";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Crisis from "@/pages/Crisis";
import Pricing from "@/pages/Pricing";
import Install from "@/pages/Install";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Support from "@/pages/Support";
import SuperAdmin from "@/pages/SuperAdmin";
import Workspaces from "@/pages/Workspaces";
import AcceptInvitation from "@/pages/AcceptInvitation";
import SocialNetworks from "@/pages/SocialNetworks";
import Influencers from "@/pages/Influencers";
import QuickChart from "@/pages/QuickChart";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useAppUpdate(60_000);
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite/:token" element={<AcceptInvitation />} />
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mentions" element={<DemoGate feature="Mentions & sentiments" description="L'accès aux mentions, sentiments et posts d'influenceurs nécessite une licence active." redirect><Mentions /></DemoGate>} />
                <Route path="/alerts" element={<DemoGate feature="Centre d'alertes" description="La consultation et la création d'alertes nécessitent une licence active." redirect><Alerts /></DemoGate>} />
                <Route path="/competitors" element={<DemoGate feature="Veille concurrentielle" description="Comparez votre marque à vos concurrents en temps réel. Disponible dès le plan Starter." redirect><Competitors /></DemoGate>} />
                <Route path="/ai-assistant" element={<DemoGate feature="FocusGPT" description="Assistant IA avancé pour analyser et répondre aux mentions. Disponible dès le plan Pro." redirect><AIAssistant /></DemoGate>} />
                <Route path="/reports" element={<DemoGate feature="Rapports PDF & Excel" description="Génération et téléchargement de rapports professionnels. Disponible dès le plan Starter." redirect><Reports /></DemoGate>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/surveillance" element={<Navigate to="/settings?tab=surveillance" replace />} />
                <Route path="/crisis" element={<DemoGate feature="Gestion de crise" description="Module avancé de détection et gestion de crise. Disponible dès le plan Pro." redirect><Crisis /></DemoGate>} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/install" element={<Install />} />
                <Route path="/support" element={<Support />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route path="/social-networks" element={<SocialNetworks />} />
                <Route path="/influencers" element={<DemoGate feature="Influenceurs" description="Identifiez les voix qui parlent de votre marque. Disponible dès le plan Starter." redirect><Influencers /></DemoGate>} />
                <Route path="/quick-chart" element={<DemoGate feature="Graphiques rapides" description="Visualisez vos mentions en un coup d'œil. Disponible dès le plan Starter." redirect><QuickChart /></DemoGate>} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
