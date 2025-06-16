import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AudioChat } from "./audio-chat.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioChat />
  </StrictMode>,
);
