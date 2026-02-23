import { io, Socket } from "socket.io-client";
import { BE_URL } from "@/lib/api";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  console.log("Connecting WebSocket to", BE_URL);

  socket = io(BE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  console.log("WebSocket connection initiated", socket);

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
