import { useStreams } from "@/web/app/room/_components/context-providers/streams";
import Loader from "@/web/app/room/_components/loader";
import useGlobalStore from "@/web/store/global";
import usePlayerStore from "@/web/store/players";
import { useStreamsStore } from "@/web/store/streams";
import { useEffect } from "react";

// This component must be inside the SocketConnection component
export default function ConnectSocket({
  children
}: {
  children: React.ReactNode;
}) {

  const { socket, socketConnectCallbacks } = useGlobalStore();
  const { players } = usePlayerStore();
  const { setLocalTrack, isVideoEnabled, isAudioEnabled } = useStreamsStore();
  const { peersRef } = useStreams();

  useEffect(() => {
    if(!socket) return console.error("Socket is not initialized");
    
    socket.connect();

    const callbacks = socketConnectCallbacks.map(cb => cb(socket));
    Promise.all(callbacks).then(async () => {
      // After all callbacks have been managed

      /**
       * @description
       * This here solves the god-awful problem when camera toggling, because I couldn't figure out renegotiation
       * when changing streams as opposed to only tracks.
       * @update
       * Doesn't work apparently 🤯
       */
      // setTimeout(() => {
      //   console.log("DISABLEDING: ", isVideoEnabled, isAudioEnabled);
        
      //   if (!isVideoEnabled) setLocalTrack("video",false, peersRef.current!, socket);
      //   if (!isAudioEnabled) setLocalTrack("audio",false, peersRef.current!, socket);
      // }, 200);

      // await setLocalTrack("video", true, peersRef.current!, socket);
      // await setLocalTrack("audio", true, peersRef.current!, socket);
    });
  }, [socket]);

  // if (!socket || players.length < 1) return <div>Socket Loading....</div>
  if (!socket || players.length < 1) return <Loader title="Socket Loading..." subtitle="The server is configuring socket connections." progress={60} />
  
  return children;
}

