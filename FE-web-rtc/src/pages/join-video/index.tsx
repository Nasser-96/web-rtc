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
import { AudioVideoStatusEnum, RoleStateEnum } from "@/types&enums/enums";
import { Socket } from "socket.io-client";

interface VideoStreamProps {
  token: string;
}

export default function VideoStream({ token }: VideoStreamProps) {
  const searchParams = useSearchParams();
  const { isWindow } = useWindowIsLoaded();
  const largeFeedRef = useRef<HTMLVideoElement>(null);
  const ownFeedRef = useRef<HTMLVideoElement>(null);
  const uuidRef = useRef<string | null>(null);
  const [showCallInfo, setCallInfo] = useState<boolean>(true);
  const socketRef = useRef<Socket | null | undefined>(null);
  const [appointmentData, setAppointmentData] =
    useState<GetValidateDataTokenType>();
  const { socket } = useNewSocket("join-video", token);
  const { callState, setCallState } = useVideoStore();
  const { streams, setStream } = useStreamStore();

  const fetchDecodedToken = async () => {
    if (token) {
      try {
        const decodedToken: ReturnResponseType<GetValidateDataTokenType> =
          await getDecodeTokenService(token);
        setAppointmentData(decodedToken.response);
        uuidRef.current = decodedToken.response.uuid;
      } catch (error: any) {
        if (error?.response?.data?.error_msg === "Token Expired") {
          console.log("Token Expired");
        }
      }
    }
  };

  const addIce = (iceCandidate: RTCIceCandidate) => {
    socketRef?.current?.emit("iceToServer", {
      iceCandidate,
      who: "client",
      uuid: uuidRef.current,
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
    const createOfferAsync = async () => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          try {
            const pc = streams[stream].peerConnection;
            const offer = await pc?.createOffer();
            pc?.setLocalDescription(offer);

            socket?.emit("newOffer", { offer, appointmentData });
          } catch (error) {
            console.log(error);
          }
          setCallState({ ...callState, haveCreatedOffer: true });
        }
      }
    };

    if (
      callState.audio === AudioVideoStatusEnum.ENABLED &&
      callState.video === AudioVideoStatusEnum.ENABLED &&
      !callState.haveCreatedOffer
    ) {
      createOfferAsync();
    }
  }, [callState.audio, callState.video, callState.haveCreatedOffer]);

  useEffect(() => {
    if (isWindow) {
      fetchDecodedToken();
    }
  }, [isWindow, token]);

  useEffect(() => {
    socketRef.current = socket;
    const addIceCandidate = (data: RTCIceCandidate) => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          const pc = streams[stream].peerConnection;
          pc?.addIceCandidate(data);
          console.log("Added an IceCandidate to existing page presence");
          setCallInfo(false);
        }
      }
    };

    if (socket) {
      socket?.off("iceToClient");
      socket?.off("answerToClient");
    }

    socket?.on("answerToClient", (data: any) => {
      if (data) {
        setCallState({
          ...callState,
          answer: data,
          myRole: RoleStateEnum.OFFERER,
        });
      }
    });
    socket?.on("iceToClient", (data: RTCIceCandidate) => {
      addIceCandidate(data);
    });

    return () => {
      socket?.off("iceToClient");
      socket?.off("answerToClient");
    };
  }, [socket, streams]);

  useEffect(() => {
    const asyncAddAnswer = async () => {
      for (const stream in streams) {
        if (stream !== "localStream") {
          const pc = streams[stream].peerConnection;
          if (callState.answer) {
            console.log("pc?.signalingState222", pc?.signalingState);
            await pc?.setRemoteDescription(callState.answer);
            console.log("Answer added!");
          }
        }
      }
    };
    if (callState.answer) {
      asyncAddAnswer();
    }
  }, [callState.answer]);

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
        {showCallInfo && appointmentData && (
          <CallInfo appointmentData={appointmentData} />
        )}
        {/* <ChatWindow /> */}
        <div className="absolute bottom-0 w-full bg-gray-800 px-4">
          <ActionButtons ownFeedRef={ownFeedRef} largeFeedRef={largeFeedRef} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { query } = context;
  const token = query.token; // Access the query parameter

  return {
    props: {
      token,
    },
  };
}
