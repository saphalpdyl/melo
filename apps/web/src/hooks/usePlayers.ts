import { useEffect, useState } from "react";
import Socket from "../core/socket";

import usePlayerStore from "@/web/store/players";

import type { PlayerData } from "@melo/types";

// This is a setup hooks, not to be used directly in components
let __isCalled = false;

const usePlayers = (socket: Socket | null) => {
  const {
    players,
    setPlayers,
    handlePositionChange,
    handleDisplayNameChange,
    getCurrentPlayer,
  } = usePlayerStore();

  const [ loading, setLoading ] = useState(true);
  
  useEffect(() => {
    // Ensuring one-time-call behavior
    if (__isCalled) return console.error("usePlayers should only be called once");
    __isCalled = true;
    
    setLoading(true);
    if(!socket) return console.error("Socket is not initialized");
    
    if (socket.isRegistered("global-player-data-update")) return;
    
    socket.on("global-player-data-update", ({ data }) => {
      // Data comes in as Object [string]: PlayerData, we need to convert to PlayerData[]
      const players = Object.values(data as Record<string, PlayerData>);
      setPlayers(players);
    });

    setLoading(false);
  }, [socket]);

  return {
    players,
    handlePositionChange,
    handleDisplayNameChange,
    getCurrentPlayer,
    loading,
  }
}

export default usePlayers;