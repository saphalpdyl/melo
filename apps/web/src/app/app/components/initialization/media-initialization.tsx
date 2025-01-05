import VideoStream from "@/web/app/app/components/video-stream";
import { Button } from "@/web/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/web/components/ui/select";
import { Mic, MicOff, SquarePlus, Video, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaInitializationProps {
  onInitialize: (
    stream: MediaStream,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    videoDeviceId: string,
    audioDeviceId: string,
  ) => void;
}

interface MediaSelectProps {
  mediaEnabled: boolean;
  currentDeviceId: string | null;
  inputDevices: MediaDeviceInfo[];
  mediaToggleHandler: (value: boolean) => void;
  onDeviceChange: (deviceId: string) => void;
  kind: "video" | "audio";
}

const MediaSelect = ({
  mediaEnabled,
  mediaToggleHandler,
  currentDeviceId,
  inputDevices,
  onDeviceChange,
  kind,
}: MediaSelectProps) => {
  return <div className="flex flex-col gap-1 mb-2 mt-2">
    <h3 className="text-lg font-bold capitalize">Configure {kind}</h3>
    <div className="flex gap-3 items-center">
      <Button onClick={() => mediaToggleHandler(!mediaEnabled)} variant="outline">
        {
          mediaEnabled ? (
            kind === "audio" ? <Mic /> : <Video />
          ) : (
            kind === "audio" ? <MicOff /> : <VideoOff />
          )
        }
      </Button>

      <Select 
        value={currentDeviceId ?? ""} 
        disabled={currentDeviceId === null}
        onValueChange={onDeviceChange}
      >
        <SelectTrigger className="w-[20rem]">
          <SelectValue placeholder="Select device" />
        </SelectTrigger>
        <SelectContent>
          {
            inputDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId} className="capitalize">
                {device.label}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  </div> 
}

export default function MediaInitialization({
  onInitialize,
}: MediaInitializationProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const configureStreamMedia = async (videoDeviceId?: string, audioDeviceId?: string) => {
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
      
      return newStream;
    } catch (error) {
      console.error('Error getting media stream:', error);
    }
  }

  const getAllMediaInputs = async () => {
    const inputs = await navigator.mediaDevices.enumerateDevices();
    const inputGroups = Object.groupBy(inputs, i => i.kind);
    
    setVideoDevices(inputGroups.videoinput ?? []);
    setAudioDevices(inputGroups.audioinput ?? []);
  }
  
  useEffect(() => {
    configureStreamMedia();
    getAllMediaInputs();
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

  return <div className="flex-[2] flex flex-col justify-center items-center lg:items-start gap-4">
    <h1 className="text-4xl font-thin text-gray-600">Setup Devices</h1>
    <div className="h-64 w-96 border-4 border-blue-400 rounded-xl">
      {
        stream && (
          <VideoStream 
            stream={stream}
            isLocal
            playerPosition={[0,0,0]}
            userPosition={[0,0,0]}
            disableDynamicVolume
          />
        )
      }
    </div>
    
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

    <Button 
      className="bg-blue-500 px-6 mx-auto lg:mr-auto"
      onClick={() => {
        if (stream) {
          console.log(videoDevices);
          onInitialize(stream, isVideoEnabled, isAudioEnabled, currentVideoDeviceId!, currentAudioDeviceId!);
        }
      }}
    >
      Join
      <SquarePlus />
    </Button>
  </div>;
}