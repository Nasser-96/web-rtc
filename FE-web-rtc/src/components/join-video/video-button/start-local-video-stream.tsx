import { StreamStateStoreType } from "@/stores/stream-store";
import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { VideoCallDataStoreType } from "@/types&enums/types";

const startLocalVideoStream = (
  streams: StreamStateStoreType,
  callState: VideoCallDataStoreType,
  setCallState: (data: VideoCallDataStoreType) => void
) => {
  const localStream = streams.localStream;

  for (const s in streams) {
    if (s !== "localStream") {
      const currentStream = streams[s];
      localStream.stream.getVideoTracks().forEach((t) => {
        currentStream.peerConnection?.addTrack(t, localStream.stream);
      });
    }
    setCallState({ ...callState, video: AudioVideoStatusEnum.ENABLED });
  }
};

export default startLocalVideoStream;
