import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Restore font size preference
const fontSize = localStorage.getItem("arobase_font_size") || "normal";
document.documentElement.classList.add(`font-${fontSize}`);

createRoot(document.getElementById("root")!).render(<App />);
