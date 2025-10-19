// make sure versions of socket.io client/server match (e.g. both 4.x)
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;

  // In prod, same-origin works if your LB/proxy routes /socket.io to backend
  // In dev, Next.js rewrites DO NOT proxy websockets, so connect directly to 5000
  const isProd = process.env.NODE_ENV === "production";

  const URL = isProd ? undefined : "http://localhost:5000";

  socket = io(URL, {
    // IMPORTANT: must match the server's path (default is "/socket.io")
    path: "/socket.io",
    // Prefer websocket transport
    transports: ["websocket"],
    // If you rely on cookies/auth, keep credentials
    withCredentials: true,
    // Helpful during local dev
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  // Basic diagnostics so failures aren’t silent
  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[socket] connected", socket?.id);
  });
  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error:", err?.message || err);
  });
  socket.on("error", (err) => {
    console.error("[socket] error:", err);
  });

  return socket;
}
