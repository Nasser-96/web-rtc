import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type StreamStateStoreType = {
  [who: string]: {
    stream: MediaStream;
    peerConnection?: RTCPeerConnection | undefined;
  };
};

export type StreamStoreType = {
  stream: StreamStateStoreType;
  setStream: (
    who: string,
    data: MediaStream,
    peerData?: RTCPeerConnection | undefined
  ) => void;
};

const useStreamStore = create<StreamStoreType>((set) => ({
  stream: {} as StreamStateStoreType,
  setStream(
    who: string,
    mediaData: MediaStream,
    peerData?: RTCPeerConnection | undefined
  ) {
    set((state) => {
      return {
        ...state,
        stream: {
          ...state.stream,
          [who]: { stream: mediaData, peerConnection: peerData },
        },
      };
    });
  },
}));

export default useStreamStore;
