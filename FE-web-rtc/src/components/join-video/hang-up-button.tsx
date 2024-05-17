import useStreamStore from "@/stores/stream-store";
import useCallStore from "@/stores/video-call-store";
import { RefObject } from "react";

interface HangupButtonProps {
  largeFeedRef: RefObject<HTMLVideoElement>;
  ownFeedRef: RefObject<HTMLVideoElement>;
}

export default function HangupButton({
  largeFeedRef,
  ownFeedRef,
}: HangupButtonProps) {
  const { setCallState, callState } = useCallStore();
  const { streams } = useStreamStore();

  const hangupCall = () => {
    setCallState({ ...callState, current: "complete" });
    for (const streamKey in streams) {
      const stream = streams[streamKey];
      console.log(stream.peerConnection);

      stream.peerConnection?.close();
      if (stream && stream.peerConnection) {
        stream.peerConnection.onicecandidate = null;
        stream.peerConnection = null;
      }
      if (largeFeedRef.current && ownFeedRef.current) {
        largeFeedRef.current.srcObject = null;
        ownFeedRef.current.srcObject = null;
      }
    }
  };

  if (callState.current === "complete") {
    return <></>;
  }

  return (
    <button
      className="bg-rose-600 px-3 py-2 rounded-lg text-white"
      onClick={hangupCall}
    >
      {" "}
      Hang Up{" "}
    </button>
  );
}
