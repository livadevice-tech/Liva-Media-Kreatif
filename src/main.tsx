import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and suppress benign Firestore WebChannel/network transport reconnection warnings and error logs in developer overlays
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args.map(arg => String(arg)).join(" ");
  if (
    msg.includes("@firebase/firestore") || 
    msg.includes("WebChannelConnection") || 
    msg.includes("RPC 'Listen'") || 
    msg.includes("transport errored") ||
    msg.includes("[vite] failed to connect to websocket") ||
    msg.includes("WebSocket")
  ) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  const msg = args.map(arg => String(arg)).join(" ");
  if (
    msg.includes("@firebase/firestore") || 
    msg.includes("WebChannelConnection") || 
    msg.includes("RPC 'Listen'") || 
    msg.includes("transport errored") ||
    msg.includes("[vite] failed to connect to websocket") ||
    msg.includes("WebSocket")
  ) {
    return;
  }
  originalError(...args);
};

// Handle unhandled websocket promise rejections from Vite HMR
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = reason && typeof reason === "object" ? (reason.message || "") : String(reason || "");
    if (
      msg.includes("WebSocket closed without opened") || 
      msg.includes("failed to connect to websocket")
    ) {
      event.preventDefault(); // Stop dev overlays from showing
    }
  });

  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (
      msg.includes("WebSocket closed without opened") || 
      msg.includes("failed to connect to websocket")
    ) {
      event.preventDefault(); // Stop dev overlays from showing
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
