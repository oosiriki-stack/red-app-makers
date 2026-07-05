import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { DemoGate } from "@/components/DemoGate";
import { PlanGate } from "@/components/PlanGate";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { CookieConsent } from "@/components/CookieConsent";
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const CookiesPage = lazy(() => import("@/pages/legal/Cookies"));

// Lazy-loaded routes — réduit le bundle initial et fluidifie la navigation
const Mentions = lazy(() => import("@/pages/Mentions"));
const Alerts = lazy(() => import("@/pages/Alerts"));
const Competitors = lazy(() => import("@/pages/Competitors"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const Crisis = lazy(() => import("@/pages/Crisis"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Install = lazy(() => import("@/pages/Install"));
const Register = lazy(() => import("@/pages/Register"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Support = lazy(() => import("@/pages/Support"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Workspaces = lazy(() => import("@/pages/Workspaces"));
const AcceptInvitation = lazy(() => import("@/pages/AcceptInvitation"));
const SocialNetworks = lazy(() => import("@/pages/SocialNetworks"));
const Influencers = lazy(() => import("@/pages/Influencers"));
const QuickChart = lazy(() => import("@/pages/QuickChart"));
const Pipeline = lazy(() => import("@/pages/Pipeline"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => {
  useAppUpdate(60_000);
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<CookiesPage />} />
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
                  <Route path="/ai-assistant" element={<DemoGate feature="FOCUS GPT" description="Assistant IA propriétaire FOCUS — disponible dès le plan Pro." redirect><PlanGate feature="ai_assistant" title="FOCUS GPT — Plan Pro requis"><AIAssistant /></PlanGate></DemoGate>} />
                  <Route path="/reports" element={<DemoGate feature="Rapports PDF & Excel" description="Génération et téléchargement de rapports professionnels. Disponible dès le plan Starter." redirect><PlanGate feature="reports" title="Rapports — Plan Starter requis"><Reports /></PlanGate></DemoGate>} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/surveillance" element={<Navigate to="/settings?tab=surveillance" replace />} />
                  <Route path="/crisis" element={<DemoGate feature="Gestion de crise" description="Module avancé de détection et gestion de crise. Disponible dès le plan Pro." redirect><PlanGate feature="crisis" title="Gestion de crise — Plan Pro requis"><Crisis /></PlanGate></DemoGate>} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/super-admin" element={<SuperAdmin />} />
                  <Route path="/workspaces" element={<Workspaces />} />
                  <Route path="/social-networks" element={<PlanGate feature="social_networks" title="Réseaux sociaux — Plan Starter requis"><SocialNetworks /></PlanGate>} />
                  <Route path="/influencers" element={<DemoGate feature="Influenceurs" description="Identifiez les voix qui parlent de votre marque. Disponible dès le plan Starter." redirect><PlanGate feature="influencers" title="Influenceurs — Plan Starter requis"><Influencers /></PlanGate></DemoGate>} />
                  <Route path="/quick-chart" element={<DemoGate feature="Graphiques rapides" description="Visualisez vos mentions en un coup d'œil. Disponible dès le plan Starter." redirect><PlanGate feature="quick_chart" title="Graphiques rapides — Plan Starter requis"><QuickChart /></PlanGate></DemoGate>} />
                  <Route path="/pipeline" element={<Pipeline />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
