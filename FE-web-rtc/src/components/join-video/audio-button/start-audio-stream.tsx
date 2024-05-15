import { StreamStateStoreType } from "@/stores/stream-store";
import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { VideoCallDataStoreType } from "@/types&enums/types";

const startAudioStream = (streams: StreamStateStoreType) => {
  const localStream = streams.localStream;

  for (const s in streams) {
    if (s !== "localStream") {
      const currentStream = streams[s];
      localStream.stream.getAudioTracks().forEach((t) => {
        currentStream.peerConnection?.addTrack(t, localStream.stream);
      });
    }
  }
};

export default startAudioStream;
