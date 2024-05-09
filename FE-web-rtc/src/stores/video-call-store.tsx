import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type UserStoreType = {
  videoData: VideoCallDataStoreType;
  setVideoData: (data: VideoCallDataStoreType) => void;
};

const useVideoStore = create<UserStoreType>((set) => ({
  videoData: {
    current: "idle", // negotiating, progress, complete
    video: false,
    audio: false,
    audioDevice: "default", // Chosen audio device
    videoDevice: "default", // Chosen video device
    shareScreen: false,
    haveMedia: false, // is there a localStream, has getUserMedia been run
  },
  setVideoData(userData: VideoCallDataStoreType) {
    set((state) => {
      return { ...state, userData };
    });
  },
}));

export default useVideoStore;
