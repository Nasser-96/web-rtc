import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type VideoStoreType = {
  callState: VideoCallDataStoreType;
  setCallState: (data: VideoCallDataStoreType) => void;
};

const useCallStore = create<VideoStoreType>((set) => ({
  callState: {
    current: "idle", // negotiating, progress, complete
    video: AudioVideoStatusEnum.OFF,
    audio: AudioVideoStatusEnum.OFF,
    audioDevice: "default", // Chosen audio device
    videoDevice: "default", // Chosen video device
    shareScreen: false,
    haveMedia: false, // is there a localStream, has getUserMedia been run
    haveCreatedOffer: false,
    offer: null,
    myRole: "",
    answer: null,
    haveCreatedAnswer: false,
  },
  setCallState(callStateData: VideoCallDataStoreType) {
    set((state) => {
      return { ...state, callState: callStateData };
    });
  },
}));

export default useCallStore;
