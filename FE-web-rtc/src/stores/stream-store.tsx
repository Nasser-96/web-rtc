import { VideoCallDataStoreType } from "@/types&enums/types";
import { create } from "zustand";

type StreamType = {
  [who: string]: {
    stream: MediaStream;
    peerConnection?: RTCPeerConnection | undefined;
  };
};

export type StreamStoreType = {
  stream: StreamType;
  setStream: (
    who: string,
    data: MediaStream,
    peerData?: RTCPeerConnection | undefined
  ) => void;
};

const useStreamStore = create<StreamStoreType>((set) => ({
  stream: {} as StreamType,
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
