import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (typeof window !== "undefined") {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (/athoo.*(timer|countdown|launch)/i.test(key)) window.localStorage.removeItem(key);
    }
  } catch {}
}


createRoot(document.getElementById("root")!).render(<App />);
