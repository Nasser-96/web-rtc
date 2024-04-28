import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import useUserStore from "../store/user-store";

export interface SocketStateType {
  socket: Socket | null;
  isConnected: boolean;
}

const useNewSocket = (url: string = "") => {
  const [socket, setSocket] = useState<Socket | null>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter();
  const { userData } = useUserStore();

  useEffect(() => {
    setSocket(
      io(`wss://localhost:9000/${url}`, {
        auth: { token: userData.token },
        reconnection: true,
        autoConnect: true,
        reconnectionAttempts: 4,
      })
    ); // there is query params can be passed here
  }, [userData.token]);

  useEffect(() => {
    const failedConnection = (data: any) => {
      if (data && data.message && data.message === "Invalid token") {
        router.push("login");
      }
    };
    if (socket) {
      socket.on("connect", () => {
        setIsConnected(true);
      });
      socket.on("connect_error", (data) => failedConnection(data));
      socket.on("disconnect", (data) => {
        console.log(data);
        setIsConnected(false);
      });
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return { socket, isConnected };
};

export default useNewSocket;
