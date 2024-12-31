import { create } from 'zustand';

interface StreamsState {
  peersStream: Map<string, MediaStream | null>;
  loading: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  cleanup: () => void;
  
  // Local Stream
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  toggleLocalVideo: (peersMap: Map<string, RTCPeerConnection>) => Promise<void>;
  setLocalVideo: (isVideoEnabled: boolean, peersMap: Map<string, RTCPeerConnection>) => Promise<void>;
}

export const useStreamsStore = create<StreamsState>((set, get) => ({
  localStream: null,
  peersStream: new Map(),
  loading: true,
  error: null,
  setError: (error) => set({ error }),
  cleanup: () => {
    const { localStream } = get();
    localStream?.getTracks().forEach(track => track.stop());
    set({ localStream: null, peersStream: new Map() });
  },

  isVideoEnabled: true,
  setLocalVideo: async (enableVideo, peers) => {
    const { localStream } = get();
    
    if ( localStream ) {
      if ( enableVideo ) {
        localStream.getVideoTracks().map(t => t.enabled = true);
        // try {
        //   const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        //   const videoTrack = newStream.getVideoTracks()[0];
          
        //   // Add the track to local stream
        //   localStream.addTrack(videoTrack);
          
        //   // Create a new MediaStream instance with all current tracks
        //   const updatedStream = new MediaStream(localStream.getTracks());
  
        //   // Update peer connections
        //   peers.forEach((pc, peerId) => {
        //     const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        //     if (sender) {
        //       sender.replaceTrack(videoTrack);
        //     } else {
        //       pc.addTrack(videoTrack, updatedStream);
        //     }
        //   });
  
        //   // Update the store with the new stream
        //   set({ 
        //     localStream: updatedStream,
        //   });
        // } catch (error) {
        //   set({ error: error as Error });
        // }
      } else {
        
        // // Turning video off
        // const videoTracks = localStream.getVideoTracks();
        
        // videoTracks.forEach(track => {
        //   track.stop();
        //   localStream.removeTrack(track);
        // });

        // // Update peer connections
        // peers.forEach((pc, peerId) => {
        //   const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        //   if (sender) {
        //     pc.removeTrack(sender);
        //   }
        // });

        localStream.getVideoTracks().forEach(t => t.enabled = false);
      }
      set({
        isVideoEnabled: enableVideo,
      })
    } else {
      console.log('No local stream available');
    }
  },
  toggleLocalVideo: async (peers) => {
    const { isVideoEnabled} = get();
    
    if (isVideoEnabled)
      // If enabled, disable it
      get().setLocalVideo(false, peers);
    else
      get().setLocalVideo(true, peers);
        
  }
}));