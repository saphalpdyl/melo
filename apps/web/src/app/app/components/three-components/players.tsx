import useGlobalStore from "@/web/store/global";
import { useStreamsStore } from "@/web/store/streams";

import Player from "./player";
import usePlayerStore from "@/web/store/players";
import { usePlayers } from "@/web/app/app/components/context-providers/players";

export default function Players() {
  const { socket } = useGlobalStore();

  const {
    players,
  } = usePlayerStore();
  const { getCurrentPlayer } = usePlayers();
  
  const { localStream, peersStream } = useStreamsStore();

  const currentPlayer = getCurrentPlayer();

  if (!currentPlayer) return null;
  
  return players.map(player => (
    <Player 
      key={player.connectionId}
      stream={player.connectionId === socket?.id ? localStream : peersStream.get(player.connectionId)!}  
      isLocal={player.connectionId === socket?.id}
      player={player}
      userPosition={currentPlayer.position}
    />
  ));
}