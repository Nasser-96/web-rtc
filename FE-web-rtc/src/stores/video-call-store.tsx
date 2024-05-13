import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type UserStoreType = {
  callState: VideoCallDataStoreType;
  setCallState: (data: VideoCallDataStoreType) => void;
};

const useCallStore = create<UserStoreType>((set) => ({
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
      return { ...state, userData };
    });
  },
}));

export default useCallStore;
