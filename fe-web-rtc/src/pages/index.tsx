import useNewSocket from "../socket/new-socket";
import { useEffect, useRef, useState } from "react";
import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";

export default function Home() {
  const { socket } = useNewSocket();
  const { isWindow } = useWindowIsLoaded();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const theirVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>();
  const [mediaWidth, setMediaWidth] = useState<number>(0);
  const [mediaHeight, setMediaHeight] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [videoRecorded, setVideoRecorded] = useState<Blob[]>([]);

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

  const changeVideoSize = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        const videoConstraints: MediaTrackConstraints = {
          height: mediaHeight,
          width: mediaWidth,
          // frameRate: 1000,
          // aspectRatio:10
        };
        track.applyConstraints(videoConstraints);
      });
    }
  };

  const startRecording = async () => {
    if (stream) {
      const tempMediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(tempMediaRecorder);

      const tempBlob = [...videoRecorded];
      tempMediaRecorder.ondataavailable = (e) => {
        tempBlob.push(e.data);
      };
      setVideoRecorded(tempBlob);
      tempMediaRecorder.start();
    }
  };
  const stopRecording = () => {
    mediaRecorder?.stop();
  };
  const playRecording = () => {
    if (isWindow && theirVideoRef.current) {
      const superBuffer = new Blob(videoRecorded);

      theirVideoRef.current.src = window.URL.createObjectURL(superBuffer);
      theirVideoRef.current.controls = true;
      theirVideoRef.current.play();
    }
  };

  return (
    <div className="flex items-center justify-center">
      <main className="container flex justify-between items-center gap-10">
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() =>
              shareMiceAndVideo({
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                },
                video: true,
              })
            }
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
              onClick={changeVideoSize}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Change screen size
            </button>
            <input
              type="number"
              className="w-full px-4 rounded-lg"
              onChange={(e) => setMediaWidth(parseInt(e.target.value))}
            />
            <input
              type="text"
              className="w-full px-4 rounded-lg"
              onChange={(e) => setMediaHeight(parseInt(e.target.value))}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Start recording
            </button>
            <button
              onClick={stopRecording}
              className="border rounded-xl p-2 w-full text-white mt-3"
            >
              Stop recording
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={playRecording}
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
            className="w-full h-fit bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={myVideoRef}
          />
          <h1 className="font-bold text-white text-3xl">Their feed</h1>
          <video
            className="w-full h-[40vh] bg-slate-800 rounded-md"
            autoPlay
            playsInline
            ref={theirVideoRef}
          />
        </div>
      </main>
    </div>
  );
}
