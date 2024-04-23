import useNewSocket from "../socket/new-socket";
import { useEffect, useRef, useState } from "react";
import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";

export default function Home() {
  const { socket } = useNewSocket();
  const { isWindow } = useWindowIsLoaded();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>();

  const shareMiceAndVideo = async (constrains: MediaStreamConstraints) => {
    if (isWindow) {
      try {
        const data: MediaStream = await navigator.mediaDevices.getUserMedia(
          constrains
        );
        setStream(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const showVideo = () => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream;
    }
  };

  const stopVideo = () => {
    if (myVideoRef.current && stream) {
      const tracks = stream.getTracks();
      tracks?.forEach((track) => {
        track.stop();
      });
      myVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className="flex items-center justify-center">
      <main className="container flex justify-between items-center gap-10">
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => shareMiceAndVideo({ audio: false, video: true })}
            className="border rounded-xl p-2 text-white mt-3"
          >
            Share my mic and camera
          </button>
          <button
            onClick={showVideo}
            className="border rounded-xl p-2 text-white mt-3"
          >
            Show My Video
          </button>
          <button
            onClick={stopVideo}
            className="border rounded-xl p-2 text-white mt-3"
          >
            Stop My Video
          </button>
          <div className="flex gap-3">
            <button
              // onClick={SendMessageToServer}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Change screen size
            </button>
            <input
              type="text"
              className="w-full px-4 rounded-lg"
              // value={messageClient}
              // onChange={(e) => setMessage(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-4 rounded-lg"
              // value={messageClient}
              // onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              // onClick={SendMessageToServer}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Start recording
            </button>
            <button
              // onClick={SendMessageToServer}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Stop recording
            </button>
          </div>
          <div className="flex gap-3">
            <button
              // onClick={SendMessageToServer}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Play recording
            </button>
            <button
              // onClick={SendMessageToServer}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Share Screen
            </button>
          </div>
          <button
            // onClick={SendMessageToServer}
            className="border rounded-xl p-2 w-full text-white mt-3"
          >
            Make An Offer
          </button>
          <button
            // onClick={SendMessageToServer}
            className="border rounded-xl p-2 w-full text-white mt-3"
          >
            Accept Offer/Make Answer
          </button>
          <button
            // onClick={SendMessageToServer}
            className="border rounded-xl p-2 w-full text-white mt-3"
          >
            Show Other Video
          </button>
        </div>
        <div className="w-full flex flex-col gap-4">
          <h1 className="font-bold text-white text-3xl">My feed</h1>
          <video
            className="w-full h-[40vh] bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={myVideoRef}
          />
          <h1 className="font-bold text-white text-3xl">Their feed</h1>
          <video
            className="w-full h-[40vh] bg-slate-800 rounded-md"
            autoPlay
            playsInline
          />
        </div>
      </main>
    </div>
  );
}
