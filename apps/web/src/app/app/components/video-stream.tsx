import { useStreamsStore } from "@/web/store/streams";
import { CameraOff, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

type VideoStreamProps = {
  stream: MediaStream | null;
  isLocal: boolean;
  hideName?: boolean;
  userPosition: [number, number, number];
  playerPosition: [number, number, number];
  disableDynamicVolume?: boolean;
  disabled?: boolean;
};

const VOLUME_MAX_DISTANCE_CAN_HEAR = 3; 
const VOLUME_DECAY_RATE = 1;

export default function VideoStream({
  stream,
  isLocal,
  hideName = false,
  userPosition,
  playerPosition,
  disableDynamicVolume = false,
  disabled = false,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update volume based on distance
  useEffect(() => {
    if (!videoRef.current || isLocal) return;
    if (disableDynamicVolume) return;

    const userVec = new Vector3(...userPosition);
    const playerVec = new Vector3(...playerPosition);
    const distance = userVec.distanceTo(playerVec);


    const volume = 1 / (1 + Math.exp(-VOLUME_DECAY_RATE * (VOLUME_MAX_DISTANCE_CAN_HEAR - distance)))

    videoRef.current.volume = volume;
  }, [playerPosition, userPosition, isLocal]);

  // Set video stream
  const { isVideoEnabled } = useStreamsStore();
  
  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream, isVideoEnabled]);

  return (
    <>
      {
        stream?.getVideoTracks()[0]?.enabled === false ? (
          <div className="relative w-full h-full rounded-lg flex items-center justify-center text-white bg-black">
            <CameraOff />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-lg overflow-hidden text-white">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              className="w-full h-full object-cover"
              style={{
                transform: `scaleX(${isLocal ? -1 : 1})`,
              }}
            />
          </div>
        )
      }
      {!hideName && isLocal && (
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
          You
        </div>
      )}

      {/* Check for audio mute */}
      {/* {
        (stream === null || stream.getAudioTracks().length == 0) && (
          <div className="absolute bottom-2 right-2 text-red-500">
            <MicOff size={12} />
          </div>
        )
      } */}
    </>
  );
}