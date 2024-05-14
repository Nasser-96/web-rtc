import useCallStore from "@/stores/video-call-store";

export default function HangupButton() {
  const { setCallState, callState } = useCallStore();

  const hangupCall = () => {
    setCallState({ ...callState, current: "complete" });
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
