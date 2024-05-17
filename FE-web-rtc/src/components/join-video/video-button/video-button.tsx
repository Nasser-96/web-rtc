import ActionButton from "@/components/shared/action-button";
import useStreamStore from "@/stores/stream-store";
import useCallStore from "@/stores/video-call-store";
import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { RefObject, useEffect, useRef, useState } from "react";
import { FaVideo } from "react-icons/fa";
import { RiArrowUpSFill } from "react-icons/ri";
import startLocalVideoStream from "./start-local-video-stream";
import DropDownMenu from "../drop-down-menu";
import HandelOutSideClick from "@/helpers/handle-click-outside";
import { getDevices } from "./get-devices";

interface VideoButtonProps {
  ownFeedRef: RefObject<HTMLVideoElement>;
}

export default function VideoButton({ ownFeedRef }: VideoButtonProps) {
  const { callState, setCallState } = useCallStore();
  const { streams, setStream } = useStreamStore();
  const [pendingUpdate, setPendingUpdate] = useState<boolean>(false);
  const [caretOpen, setCaretOpen] = useState<boolean>(false);
  const videoDropDownRef = useRef<HTMLDivElement>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);

  const startStopVideo = async () => {
    if (ownFeedRef.current) {
      if (callState.video === AudioVideoStatusEnum.ENABLED) {
        setCallState({ ...callState, video: AudioVideoStatusEnum.DISABLED });
        const tracks = streams.localStream.stream.getVideoTracks();
        tracks.forEach((track) => {
          track.enabled = false;
        });
      } else if (callState.video === AudioVideoStatusEnum.DISABLED) {
        setCallState({ ...callState, video: AudioVideoStatusEnum.ENABLED });
        const tracks = streams.localStream.stream.getVideoTracks();
        tracks.forEach((track) => {
          track.enabled = true;
        });
      } else if (callState.haveMedia) {
        ownFeedRef.current.srcObject = streams.localStream.stream;
        startLocalVideoStream(streams, callState, setCallState);
      } else {
        setPendingUpdate(true);
      }
    }
  };

  const changeVideoDevice = async (device: MediaDeviceInfo) => {
    const newConstrains: MediaStreamConstraints = {
      audio:
        callState.audio === AudioVideoStatusEnum.OFF
          ? false
          : callState.audioDevice === "default"
          ? true
          : { deviceId: { exact: callState.audioDevice } },
      video: { deviceId: { exact: device.deviceId } },
    };

    const newStream = await navigator.mediaDevices.getUserMedia(newConstrains);
    setCallState({
      ...callState,
      videoDevice: device.deviceId,
      video: AudioVideoStatusEnum.ENABLED,
    });
    if (ownFeedRef.current) {
      ownFeedRef.current.srcObject = newStream;
    }
    setStream(
      "localStream",
      newStream,
      streams.localStream.peerConnection as RTCPeerConnection
    );
    const [videoTrack] = newStream.getVideoTracks();
    for (const stream in streams) {
      if (stream !== "localStream") {
        const senders = streams[stream].peerConnection?.getSenders();
        const sender = senders?.find((s) => {
          if (s.track) {
            return s.track.kind === videoTrack.kind;
          } else {
            return false;
          }
        });
        sender?.replaceTrack(videoTrack);
      }
    }
  };

  useEffect(() => {
    if (pendingUpdate && callState.haveMedia && ownFeedRef.current) {
      setPendingUpdate(false);
      ownFeedRef.current.srcObject = streams.localStream.stream;
      startLocalVideoStream(streams, callState, setCallState);
    }
  }, [pendingUpdate, callState.haveMedia]);

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        const devices = await getDevices();
        setVideoDeviceList(devices.videoDevices);
      }
    };

    getDevicesAsync();
  }, [caretOpen]);

  return (
    <div className="relative w-fit">
      <button
        onClick={() => setCaretOpen(!caretOpen)}
        className="absolute w-fit right-0 hover:bg-gray-700"
      >
        <RiArrowUpSFill size={30} className="text-white" />
      </button>
      <ActionButton
        text={`${
          callState.video === AudioVideoStatusEnum.ENABLED ? "Stop" : "Start"
        } Video`}
        onClick={startStopVideo}
        icon={<FaVideo size={30} />}
      />
      {caretOpen && (
        <div ref={videoDropDownRef}>
          <DropDownMenu
            deviceList={videoDeviceList}
            onClick={(data) => changeVideoDevice(data)}
          />
        </div>
      )}
      <HandelOutSideClick
        OnOutsideClick={() => setCaretOpen(false)}
        isOpen={caretOpen}
        targetRef={videoDropDownRef}
      />
    </div>
  );
}
