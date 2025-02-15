import { useEffect, useState } from "react";
import VideoStream from "@/web/components/room/components/video-stream";
import { Button } from "@melo/ui/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@melo/ui/ui/alert";
import { Info, SquarePlus, AlertCircle } from "lucide-react";
import MediaSelect from "./components/media-select";

interface MediaInitializationProps {
  onInitialize: (
    stream: MediaStream,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    videoDeviceId: string,
    audioDeviceId: string,
  ) => void;
}

export default function MediaInitialization({
  onInitialize,
}: MediaInitializationProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<{ title: string; description: string } | null>(null);

  const configureStreamMedia = async (videoDeviceId?: string, audioDeviceId?: string) => {
    // Clear any existing error
    setError(null);
    
    // Stop all tracks in the existing stream if it exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: videoDeviceId ? {
          deviceId: { exact: videoDeviceId }
        } : true,
        audio: audioDeviceId ? {
          deviceId: { exact: audioDeviceId }
        } : true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      // Update enabled states based on current settings
      newStream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
      newStream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
      getAllMediaInputs();
      
      return newStream;
    } catch (error) {
      if (error instanceof DOMException) {
      console.log(error.name);
        switch (error.name) {
          case "NotAllowedError":
            // Skip showing alert for permission denied
            setError({
              title: "Permission required",
              description: "The application requires camera and microphone access."
            });
            break;
          case "NotReadableError":
            setError({
              title: "Device Access Error",
              description: "Could not access your media device. It may be in use by another application."
            });
            break;
          case "NotFoundError":
            setError({
              title: "Device Not Found",
              description: "The requested media device was not found. Please check your camera and microphone connections."
            });
            break;
        }
      }
      console.log('Error getting media stream:', error);
    }
  };

  // Rest of the component remains the same...
  const getAllMediaInputs = async () => {
    const inputs = await navigator.mediaDevices.enumerateDevices();
    const inputGroups = Object.groupBy(inputs, i => i.kind);
    
    setVideoDevices(inputGroups.videoinput ?? []);
    setAudioDevices(inputGroups.audioinput ?? []);
  }
  
  useEffect(() => {
    configureStreamMedia();
    getAllMediaInputs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
      stream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
    }
  }, [isVideoEnabled, isAudioEnabled, stream]);
  
  const getInputDeviceByKind = (kind: "video" | "audio"): string | null => {
    let inputDeviceId = null;

    if (stream && stream.getTracks().find(t => t.kind === kind) !== null) {
      const inputTrack = stream.getTracks().find(t => t.kind === kind);
      if (!inputTrack) return null;
      
      (kind === "audio" ? audioDevices : videoDevices).forEach(d => {
        if (d.label === inputTrack.label) inputDeviceId = d.deviceId;
      });
    }

    return inputDeviceId;
  }

  const changeDevices = async (deviceId: string, kind: "video" | "audio") => {
    const currentVideoId = kind === "video" ? deviceId : getInputDeviceByKind("video");
    const currentAudioId = kind === "audio" ? deviceId : getInputDeviceByKind("audio");
    
    const newStream = await configureStreamMedia(currentVideoId ?? undefined, currentAudioId ?? undefined);
    if (newStream) {
      // Refresh device list after changing devices
      getAllMediaInputs();
    }
  }
  
  const currentVideoDeviceId = getInputDeviceByKind("video");
  const currentAudioDeviceId = getInputDeviceByKind("audio");

  return <div className="flex-[2] flex flex-col justify-center  lg:items-start">
    <h1 className="text-4xl font-thin text-gray-600 mb-1">Setup Devices</h1>
    <p className="text-xs text-gray-500 mb-4">Configure your camera and microphone before joining the space</p>
    <div className="h-64 w-96 border-4 border-lime-400 rounded-xl">
      {
        stream && (
          <VideoStream 
            stream={stream}
            isLocal
            playerPosition={[0,0,0]}
            userPosition={[0,0,0]}
            disableDynamicVolume
            hasVideo={true}
            hasAudio={false}
          />
        )}
      </div>
      {error && (
        <Alert variant={error.title === "Permission required" ? "default" : "destructive"} className="mt-4 w-96">
          {
            error.title === "Permission required" && <AlertCircle className="w-4 h-4" />
          }
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription className="text-xs">{error.description}</AlertDescription>
        </Alert>
      )}

      <span className="text-xs text-gray-500 inline-flex items-center font-sans gap-1 mt-2">
        <Info size={12} />
        Preview your camera to ensure proper lighting and positioning
      </span>
      
      <div className="mt-4"></div>
      
      <MediaSelect
        mediaEnabled={isVideoEnabled}
        mediaToggleHandler={setVideoEnabled}
        currentDeviceId={currentVideoDeviceId}
        inputDevices={videoDevices}
        onDeviceChange={(deviceId) => changeDevices(deviceId, "video")}
        kind="video"
      />

      <MediaSelect
        mediaEnabled={isAudioEnabled}
        mediaToggleHandler={setAudioEnabled}
        currentDeviceId={currentAudioDeviceId}
        inputDevices={audioDevices}
        onDeviceChange={(deviceId) => changeDevices(deviceId, "audio")}
        kind="audio"
      />

      <p className="text-xs text-neutral-400 font-sans mt-3 mb-2">
        All devices configured properly • Ready to join
      </p>
      <Button 
        className="bg-lime-500 px-6 mx-auto lg:mx-0"
        onClick={() => {
          if (stream) {
            onInitialize(stream, isVideoEnabled, isAudioEnabled, currentVideoDeviceId!, currentAudioDeviceId!);
          }
        }}
      >
        Join
        <SquarePlus />
      </Button>
    </div>
}