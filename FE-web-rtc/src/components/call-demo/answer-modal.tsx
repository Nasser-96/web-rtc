import { useState } from "react";
import Button from "../shared/button";
import Modal from "../shared/modal";
import Toggle from "../shared/toggle";
import { FaMicrophone } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";

interface AnswerModalProps {
  constraints: MediaStreamConstraints;
  isOffer?: boolean;
  closeModal: (value: boolean) => void;
  setConstraints: (constraints: MediaStreamConstraints, type: string) => void;
  acceptCall: () => void;
  shareScreen?: () => void;
}

export default function AnswerModal({
  constraints,
  isOffer,
  closeModal,
  setConstraints,
  acceptCall,
  shareScreen,
}: AnswerModalProps) {
  const [error, setError] = useState<string>("");
  const hitCall = () => {
    if (isOffer && !constraints.audio && !constraints.video) {
      setError("One of audio and video should be on");
    } else {
      setError("");
      acceptCall();
    }
  };
  return (
    <Modal extraClasses="!bg-slate-900">
      <>
        {error && (
          <div className="flex w-full items-center justify-center text-red-600">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <FaMicrophone size={25} className="text-white" />
          <Toggle
            isChecked={Boolean(constraints.audio)}
            onChange={() =>
              setConstraints(
                {
                  video: constraints.video,
                  audio: !constraints.audio,
                },
                isOffer ? "offer" : "answer"
              )
            }
          />
        </div>
        <div className="flex gap-3 mt-7">
          <FaVideo size={25} className="text-white" />
          <Toggle
            isChecked={Boolean(constraints.video)}
            onChange={() =>
              setConstraints(
                {
                  video: !constraints.video,
                  audio: constraints.audio,
                },
                isOffer ? "offer" : "answer"
              )
            }
          />
        </div>
        <div className="flex w-full items-center justify-center gap-4 mt-10">
          <Button onClick={hitCall} className="bg-emerald-700">
            Accept
          </Button>
          <Button onClick={shareScreen} className="bg-emerald-700">
            Share Screen
          </Button>
          <Button className="bg-red-700">Reject</Button>
        </div>
        <div className="flex w-full items-center justify-center gap-4 mt-4">
          <Button
            onClick={() => {
              closeModal(false);
            }}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </>
    </Modal>
  );
}
