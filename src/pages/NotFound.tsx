import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl font-bold text-gradient-gold mb-2">404</div>
        <h1 className="text-xl font-bold mb-1">@robase</h1>
        <p className="text-muted-foreground mb-6">
          Cette page n'existe pas ou a été déplacée. Retournez au tableau de bord pour continuer.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <Button asChild>
            <Link to="/"><Home className="h-4 w-4 mr-2" /> Dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
