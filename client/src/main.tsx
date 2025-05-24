import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GameProvider } from "./context/GameContext";
import { ThemeProvider } from "./lib/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <GameProvider>
      <App />
    </GameProvider>
  </ThemeProvider>
);
