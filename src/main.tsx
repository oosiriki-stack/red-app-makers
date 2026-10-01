import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { registerFocusPwa } from "@/lib/registerPwa";

// Restore font size preference
const fontSize = localStorage.getItem("arobase_font_size") || "normal";
document.documentElement.classList.add(`font-${fontSize}`);

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
}

void registerFocusPwa();
