import { createRoot } from "react-dom/client";
import "./main.css";
import { App } from "./components/app.js";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
