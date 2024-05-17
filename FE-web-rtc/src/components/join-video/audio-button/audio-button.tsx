import ActionButton from "@/components/shared/action-button";
import useCallStore from "@/stores/video-call-store";
import { AudioVideoStatusEnum, MicTextEnum } from "@/types&enums/enums";
import { RefObject, useEffect, useRef, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import { RiArrowUpSFill } from "react-icons/ri";
import DropDownMenu from "../drop-down-menu";
import HandelOutSideClick from "@/helpers/handle-click-outside";
import { getDevices } from "../video-button/get-devices";
import { HTMLVideoElementWithSinkId } from "@/types&enums/types";
import useStreamStore from "@/stores/stream-store";
import startAudioStream from "./start-audio-stream";

interface AudioButtonProps {
  ownFeedRef: RefObject<HTMLVideoElementWithSinkId>;
}

export default function AudioButton({ ownFeedRef }: AudioButtonProps) {
  const { callState, setCallState } = useCallStore();
  const { streams, setStream } = useStreamStore();
  const [micText, setMicText] = useState<MicTextEnum>();
  const [caretOpen, setCaretOpen] = useState<boolean>(false);
  const [audioDeviceList, setAudioDeviceList] = useState<MediaDeviceInfo[]>([]);
  const audioDropDownRef = useRef<HTMLDivElement>(null);

  const changeAudioDevice = async (device: MediaDeviceInfo) => {
    console.log(device);

    if (device.kind === "audiooutput") {
      if (ownFeedRef.current && ownFeedRef.current.setSinkId) {
        await ownFeedRef.current.setSinkId(device.deviceId);
      }
    } else if (device.kind === "audioinput") {
      console.log(callState.video);

      const newConstrains: MediaStreamConstraints = {
        audio: { deviceId: { exact: device.deviceId } },
        video:
          callState.video === AudioVideoStatusEnum.OFF
            ? false
            : callState.videoDevice === "default"
            ? true
            : { deviceId: { exact: callState.audioDevice } },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(
        newConstrains
      );
      setCallState({
        ...callState,
        audioDevice: device.deviceId,
        audio: AudioVideoStatusEnum.ENABLED,
      });
      if (ownFeedRef.current) {
        ownFeedRef.current.srcObject = newStream;
      }
      setStream(
        "localStream",
        newStream,
        streams.localStream.peerConnection as RTCPeerConnection
      );
      const [audioTrack] = newStream.getAudioTracks();

      for (const stream in streams) {
        if (stream !== "localStream") {
          const senders = streams[stream].peerConnection?.getSenders();
          const sender = senders?.find((s) => {
            if (s.track) {
              return s.track.kind === audioTrack.kind;
            } else {
              return false;
            }
          });
          sender?.replaceTrack(audioTrack);
        }
      }
    }
  };

  const startStopAudio = async () => {
    if (ownFeedRef.current) {
      if (callState.audio === AudioVideoStatusEnum.ENABLED) {
        setCallState({ ...callState, audio: AudioVideoStatusEnum.DISABLED });
        const tracks = streams.localStream.stream.getAudioTracks();
        tracks.forEach((track) => {
          track.enabled = false;
        });
      } else if (callState.audio === AudioVideoStatusEnum.DISABLED) {
        setCallState({ ...callState, audio: AudioVideoStatusEnum.ENABLED });
        const tracks = streams.localStream.stream.getAudioTracks();
        tracks.forEach((track) => {
          track.enabled = true;
        });
      } else {
        const devices = await getDevices();
        changeAudioDevice(devices.defaultDevice);
        startAudioStream(streams);
      }
    }
  };

  useEffect(() => {
    if (callState.audio === AudioVideoStatusEnum.OFF) {
      setMicText(MicTextEnum.JOIN_AUDIO);
    } else if (callState.audio === AudioVideoStatusEnum.ENABLED) {
      setMicText(MicTextEnum.MUTE);
    } else {
      setMicText(MicTextEnum.UNMUTE);
    }
  }, [callState.audio, callState.current]);

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        const devices = await getDevices();
        setAudioDeviceList(
          devices.audioInputDevices.concat(devices.audioOutputDevices)
        );
      }
    };

    getDevicesAsync();
  }, [caretOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setCaretOpen(!caretOpen)}
        className="absolute w-fit right-0 hover:bg-gray-700"
      >
        <RiArrowUpSFill size={30} className="text-white" />
      </button>
      <ActionButton
        onClick={startStopAudio}
        icon={<FaMicrophone size={30} />}
        text={micText}
      />
      {caretOpen && (
        <div ref={audioDropDownRef}>
          <DropDownMenu
            deviceList={audioDeviceList}
            isAudio
            onClick={(data) => changeAudioDevice(data)}
          />
        </div>
      )}
      <HandelOutSideClick
        OnOutsideClick={() => setCaretOpen(false)}
        isOpen={caretOpen}
        targetRef={audioDropDownRef}
      />
    </div>
  );
}
