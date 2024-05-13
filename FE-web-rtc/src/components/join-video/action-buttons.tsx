import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useCallStore from "@/stores/video-call-store";
import { MicTextEnum } from "@/types&enums/enums";
import { useEffect, useRef, useState } from "react";
import HangupButton from "./hang-up-button";
import AudioButton from "./audio-button/audio-button";
import VideoButton from "./video-button/video-button";
import ActionButton from "../shared/action-button";

interface ActionButtonsProps {}
export default function ActionButtons({}: ActionButtonsProps) {
  const { callState } = useCallStore();
  const menuButtons = useRef<HTMLDivElement>(null);
  const { isWindow } = useWindowIsLoaded();
  const [micText, setMicText] = useState<MicTextEnum>();
  let timer: NodeJS.Timeout;

  useEffect(() => {
    const setTimer = () => {
      if (callState.current === "idle") {
        timer = setTimeout(() => {
          if (menuButtons.current) {
            // menuButtons.current.classList.add("hidden");
          }
        }, 4000);
      }
    };
    if (isWindow) {
      window.addEventListener("mousemove", () => {
        if (menuButtons.current && menuButtons.current.classList) {
          // menuButtons.current.classList.remove("hidden");
          setTimer();
        } else {
          clearTimeout(timer);
          setTimer();
        }
      });
    }
    return () => {
      window.removeEventListener("mousemove", () => {
        if (menuButtons.current && menuButtons.current.classList) {
          menuButtons.current.classList.remove("hidden");
          setTimer();
        } else {
          clearTimeout(timer);
          setTimer();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (callState.current === "idle") {
      setMicText(MicTextEnum.JOIN_AUDIO);
    } else if (callState.audio) {
      setMicText(MicTextEnum.MUTE);
    } else {
      setMicText(MicTextEnum.UNMUTE);
    }
  }, [callState.audio, callState.current]);

  return (
    <div
      id="menu-buttons"
      ref={menuButtons}
      className="flex z-[9999] w-full h-fit justify-between min-h-20"
    >
      {/* <i className="fa fa-microphone" style="font-size:48px;color:red"></i> */}
      <div className="flex gap-4">
        <AudioButton />
        <VideoButton />
      </div>

      <div className="text-center flex gap-4">
        <ActionButton className="text-white">Participants</ActionButton>
        <div className="block">
          <div className="">
            {/* <i className="fa fa-comment" onClick={openCloseChat}></i>
                        <div className="btn-text" onClick={openCloseChat}>Chat</div> */}
          </div>
        </div>
        <ActionButton className="text-white">Share Screen</ActionButton>
        <ActionButton className="text-white">Chat</ActionButton>
      </div>

      <div className="flex items-center justify-center text-end">
        <HangupButton />
      </div>
    </div>
  );
}
