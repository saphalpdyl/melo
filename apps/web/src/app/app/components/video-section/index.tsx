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
    // const me = peersRef.current.get(socket!.id);

    // console.log(socket!.id);
    // console.log(peersRef.current);
    // console.log(me);

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
  
      // const senders = me?.getSenders();
      // const videoSender = senders?.find(s => s.track?.kind === "video");
  
      // if ( videoSender ) {
      //   videoTrackRef.current = localStream!.getVideoTracks()[0];
      //   me?.removeTrack(videoSender);
      //   localStream?.removeTrack(localStream.getVideoTracks()[0]);
      // }
    } else {
      
      // const newStream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Just testing if screen share stream works or not ( it doesn't )
      const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false});
      const track = newStream.getVideoTracks()[0];

      localStream?.addTrack(track);
      peersRef.current.forEach(async (pc, peerId) => {
        pc.addTrack(track);

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
      
      // if ( !videoTrackRef.current ) return console.log("OH SHITE! NO LOCAL VIDEO TRACK");
      
      // peersRef.current.forEach(async (pc, peerId) => {
      //   pc.addTrack(videoTrackRef.current!);
      //   const offer = await me?.createOffer();
      //   await me?.setLocalDescription(offer);
      //   // Send to other guys
      //   socket?.emit(WebSocketEvents.P2P_OFFER, {
      //     offer,
      //     to: peerId,
      //   });
      // })
      
    }

    // toggleLocalVideo(peersRef.current);
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