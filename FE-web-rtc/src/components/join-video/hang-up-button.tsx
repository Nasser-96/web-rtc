import useCallStore from "@/stores/video-call-store";

export default function HangupButton() {
  const { setCallState, callState } = useCallStore();

  const hangupCall = () => {
    setCallState({ ...callState, current: "complete" });
  };

  if (callState.current === " complete") {
    return <></>;
  }

  return (
    <button className="bg-red-700 p-3 rounded-3xl" onClick={hangupCall}>
      {" "}
      Hang Up{" "}
    </button>
  );
}
