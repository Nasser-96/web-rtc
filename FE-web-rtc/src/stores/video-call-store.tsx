import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type VideoStoreType = {
  callState: VideoCallDataStoreType;
  setCallState: (data: VideoCallDataStoreType) => void;
};

const useCallStore = create<VideoStoreType>((set) => ({
  callState: {
    current: "idle", // negotiating, progress, complete
    video: false,
    audio: false,
    audioDevice: "default", // Chosen audio device
    videoDevice: "default", // Chosen video device
    shareScreen: false,
    haveMedia: false, // is there a localStream, has getUserMedia been run
  },
  setCallState(userData: VideoCallDataStoreType) {
    set((state) => {
      return { ...state, callState: userData };
    });
  },
}));

export default useCallStore;
