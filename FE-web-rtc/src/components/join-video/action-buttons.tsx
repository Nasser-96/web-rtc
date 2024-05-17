import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useCallStore from "@/stores/video-call-store";
import { MicTextEnum } from "@/types&enums/enums";
import { RefObject, useEffect, useRef, useState } from "react";
import HangupButton from "./hang-up-button";
import AudioButton from "./audio-button/audio-button";
import VideoButton from "./video-button/video-button";
import ActionButton from "../shared/action-button";
import { CgScreen } from "react-icons/cg";
import { IoPeople } from "react-icons/io5";
import { BsChatFill } from "react-icons/bs";
import { RiArrowUpSFill } from "react-icons/ri";
import { HTMLVideoElementWithSinkId } from "@/types&enums/types";

interface ActionButtonsProps {
  ownFeedRef: RefObject<HTMLVideoElement>;
  largeFeedRef: RefObject<HTMLVideoElement>;
}
export default function ActionButtons({
  ownFeedRef,
  largeFeedRef,
}: ActionButtonsProps) {
  const { callState } = useCallStore();
  const menuButtons = useRef<HTMLDivElement>(null);
  const { isWindow } = useWindowIsLoaded();
  let timer: NodeJS.Timeout;

  useEffect(() => {
    const setTimer = () => {
      if (callState.current === "idle") {
        timer = setTimeout(() => {
          if (menuButtons.current) {
            menuButtons.current.classList.add("hidden");
          }
        }, 4000);
      }
    };
    if (isWindow) {
      window.addEventListener("mousemove", () => {
        if (
          menuButtons.current &&
          menuButtons.current.classList &&
          menuButtons.current.classList.contains("hidden")
        ) {
          menuButtons.current.classList.remove("hidden");
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

  return (
    <div
      id="menu-buttons"
      ref={menuButtons}
      className="flex z-[9999] w-full h-fit justify-between min-h-20"
    >
      {/* <i className="fa fa-microphone" style="font-size:48px;color:red"></i> */}
      <div className="flex gap-4">
        <AudioButton ownFeedRef={ownFeedRef} />
        <VideoButton ownFeedRef={ownFeedRef} />
      </div>

      <div className="text-center flex gap-4">
        <div className="relative ">
          <button className="absolute w-fit right-0 hover:bg-gray-700">
            <RiArrowUpSFill size={30} className="text-white" />
          </button>
          <ActionButton text="Participants" icon={<IoPeople size={30} />} />
        </div>
        <ActionButton text="Share Screen" icon={<CgScreen size={30} />} />
        <ActionButton icon={<BsChatFill size={30} />} text="Chat" />
      </div>

      <div className="flex items-center justify-center text-end">
        <HangupButton ownFeedRef={ownFeedRef} largeFeedRef={largeFeedRef} />
      </div>
    </div>
  );
}
