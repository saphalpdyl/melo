import { useStreams } from "@/web/app/app/components/context-providers/streams";
import VideoStream from "@/web/app/app/components/video-stream";
import { Button } from "@/web/components/ui/button";
import useGlobalStore from "@/web/store/global";
import { useStreamsStore } from "@/web/store/streams";
import { WebSocketEvents } from "@melo/common/constants";
import { Camera, CameraOff, Mic, MicOff, Videotape } from "lucide-react";
import { useRef } from "react";

export default function VideoSection() {
  const {
    localStream,
    isVideoEnabled, 
    toggleLocalVideo,
  } = useStreamsStore();
  
  // const localHasVideo = localStream?.getVideoTracks().length ?? false;
  // const localHasAudio = localStream?.getAudioTracks().length ?? false;

  const { peersRef } = useStreams();
  const { socket } = useGlobalStore();
  const videoTrackRef = useRef<MediaStreamTrack>(null);
    
  const handleToggleVideo = async () => {
    if ( localStream!.getVideoTracks().length >= 1 ) {
      
      peersRef.current.forEach((pc, peerId) => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === "video");
        if (videoSender) {
          pc.removeTrack(videoSender);
        }
      });
      localStream?.removeTrack(localStream.getVideoTracks()[0]);
      useStreamsStore.setState({
        isVideoEnabled: false,
      });
  
    } else {
      
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = newStream.getVideoTracks()[0];

      localStream?.addTrack(track);
      peersRef.current.forEach(async (pc, peerId) => {
        pc.addTrack(track, newStream);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(new RTCSessionDescription(offer));

          socket!.emit(WebSocketEvents.P2P_OFFER, {
            offer,
            to: peerId,
          });

        } catch (e) {
          console.log("ERROR CREATING OFFER: ", e);
        }
      });

      useStreamsStore.setState({
        isVideoEnabled: true,
      })
      
    }
  }
  
  return (
    <div className="absolute right-2 top-2 flex flex-col items-end gap-2 z-10">
      {/* Local Video Stream */}
      <div className="relative w-52 h-32 rounded-lg overflow-hidden border-2">
        <VideoStream 
          stream={localStream} 
          isLocal 
          playerPosition={[0,0,0]} 
          userPosition={[0,0,0]} 
          disableDynamicVolume
          disabled={!isVideoEnabled}
        />
      </div>
      {/* Local Stream Controls */}
      <div className="flex gap-2 ">
        <Button>
          {
            false ? <Mic /> : <MicOff />
          }
        </Button>
        <Button onClick={handleToggleVideo}>
          {
            isVideoEnabled ? <Camera /> : <CameraOff />
          }
        </Button>
      </div>
    </div>
  )
}