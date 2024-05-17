import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

export type StreamStateStoreType = {
  [who: string]: {
    stream: MediaStream;
    peerConnection?: RTCPeerConnection | null;
  };
};

export type StreamStoreType = {
  streams: StreamStateStoreType;
  setStream: (
    who: string,
    data: MediaStream,
    peerData?: RTCPeerConnection | undefined
  ) => void;
};

const useStreamStore = create<StreamStoreType>((set) => ({
  streams: {} as StreamStateStoreType,
  setStream(
    who: string,
    mediaData: MediaStream,
    peerData?: RTCPeerConnection | undefined
  ) {
    set((state) => {
      return {
        ...state,
        streams: {
          ...state.streams,
          [who]: { stream: mediaData, peerConnection: peerData },
        },
      };
    });
  },
}));

export default useStreamStore;
