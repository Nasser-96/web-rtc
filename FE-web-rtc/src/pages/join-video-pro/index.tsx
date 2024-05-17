import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import { getDecodeTokenService } from "@/model/services";
import {
  GetValidateDataTokenType,
  ReturnResponseType,
} from "@/types&enums/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CallInfo from "../../components/join-video/call-info";
import ChatWindow from "../../components/join-video/chat-window";
import useVideoStore from "@/stores/video-call-store";
import ActionButtons from "@/components/join-video/action-buttons";
import useStreamStore from "@/stores/stream-store";
import createPeerConnection from "@/helpers/create-peer-connection";
import useNewSocket from "@/socket/new-socket";
import useCallStore from "@/stores/video-call-store";
import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { Socket } from "socket.io-client";

interface VideoStreamProps {
  token: string;
  client: string;
  uuid: string;
}

export default function JoinVideoPro({
  token,
  client,
  uuid,
}: VideoStreamProps) {
  const { isWindow } = useWindowIsLoaded();
  const largeFeedRef = useRef<HTMLVideoElement>(null);
  const ownFeedRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null | undefined>(null);
  const [appointmentData, setAppointmentData] =
    useState<GetValidateDataTokenType>();
  const [haveGottenIce, setHaveGottenIce] = useState<boolean>(false);
  const { socket } = useNewSocket("join-video", token);
  const { callState, setCallState } = useVideoStore();
  const { streams, setStream } = useStreamStore();
  const uuidRef = useRef<string | null>(null);

  const fetchDecodedToken = async () => {
    if (token) {
      try {
        const decodedToken: ReturnResponseType<GetValidateDataTokenType> =
          await getDecodeTokenService(token);
        setAppointmentData(decodedToken.response);
      } catch (error: any) {
        if (error?.response?.data?.error_msg === "Token Expired") {
          console.log("Token Expired");
        }
      }
    }
  };

  const addIce = (iceCandidate: RTCIceCandidate) => {
    socketRef.current?.emit("iceToServer", {
      iceCandidate,
      who: "professional",
      uuid: uuid,
    });
  };

  useEffect(() => {
    const fetchMedia = async () => {
      const constraints = {
        video: true,
        audio: false,
      };
      try {
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setCallState({ ...callState, haveMedia: true });
        setStream("localStream", stream);
        const { peerConnection, remoteStream } = await createPeerConnection(
          addIce
        );
        setStream("remote1", remoteStream, peerConnection);
        if (largeFeedRef.current) {
          largeFeedRef.current.srcObject = remoteStream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    if (isWindow) {
      fetchDecodedToken();
    }
  }, [isWindow, token]);

  useEffect(() => {
    const setAsyncOffer = async () => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          const pc = streams[stream].peerConnection;
          if (callState.offer) {
            await pc?.setRemoteDescription(callState.offer);
            console.log(pc?.signalingState);
          }
        }
      }
    };

    if (callState.offer && streams.remote1 && streams.remote1.peerConnection) {
      setAsyncOffer();
    }
  }, [callState.offer, streams.remote1]);

  useEffect(() => {
    const createAnswerAsync = async () => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          const pc = streams[stream].peerConnection;

          if (pc?.signalingState === "have-remote-offer") {
            const answer = await pc?.createAnswer();
            await pc?.setLocalDescription(answer);
            if (answer) {
              console.log("answer", answer);

              setCallState({
                ...callState,
                haveCreatedAnswer: true,
                answer: answer,
              });
              socket?.emit("newAnswer", { answer, uuid });
            }
          }
        }
      }
    };

    if (
      callState.audio === AudioVideoStatusEnum.ENABLED &&
      callState.video === AudioVideoStatusEnum.ENABLED &&
      !callState.haveCreatedOffer
    ) {
      createAnswerAsync();
    }
  }, [callState.audio, callState.video, callState.haveCreatedAnswer]);

  useEffect(() => {
    socketRef.current = socket;

    const addIceCandidate = (data: RTCIceCandidate) => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          const pc = streams[stream].peerConnection;
          pc?.addIceCandidate(data);
          console.log("Added an IceCandidate to existing page presence");
        }
      }
    };
    if (socket) {
      socket?.off("iceToClient");
    }

    socket?.on("iceToClient", (data: RTCIceCandidate) => {
      addIceCandidate(data);
    });

    return () => {
      socket?.off("iceToClient");
    };
  }, [socket, streams]);

  useEffect(() => {
    const getIceAsync = async () => {
      const iceCandidates: RTCIceCandidate[] = await socket?.emitWithAck(
        "getIce",
        {
          uuid,
          who: "professional",
        }
      );
      console.log(iceCandidates);

      iceCandidates.forEach((ice) => {
        for (const stream in streams) {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            pc?.addIceCandidate(ice);
            console.log("============== Added IceCandidate!!!!!");
          }
        }
      });
    };
    if (streams.remote1 && !haveGottenIce) {
      setHaveGottenIce(true);
      getIceAsync();
    }
  }, [streams, socket]);

  return (
    <div dir="ltr" className="main-video-page">
      <div className="relative overflow-hidden h-screen w-screen">
        <video
          className="bg-slate-700 h-full w-full scale-x-[-1]"
          ref={largeFeedRef}
          autoPlay
          controls
          playsInline
        />
        <video
          className="absolute border border-white top-12 right-12 rounded-lg w-[320px]"
          ref={ownFeedRef}
          autoPlay
          controls
          playsInline
        />
        {appointmentData &&
          (callState.audio === AudioVideoStatusEnum.OFF ||
            callState.video === AudioVideoStatusEnum.OFF) && (
            <div className="absolute top-1/2 left-[40%] border border-slate-400 bg-slate-800 p-2 text-3xl">
              <h1 className="text-white">{client} is in the waiting room .</h1>
              <h1 className="text-white mt-2">
                Call will start when video and audio are enabled
              </h1>
            </div>
          )}
        {/* <ChatWindow /> */}
        <div className="absolute bottom-0 w-full bg-gray-800 px-4">
          <ActionButtons largeFeedRef={largeFeedRef} ownFeedRef={ownFeedRef} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { query } = context;
  const token = query.token;
  const client = query.client;
  const uuid = query.uuid;

  return {
    props: {
      token,
      client,
      uuid,
    },
  };
}
