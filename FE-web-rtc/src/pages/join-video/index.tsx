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

interface VideoStreamProps {
  token: string;
}

export default function VideoStream({ token }: VideoStreamProps) {
  const searchParams = useSearchParams();
  const { isWindow } = useWindowIsLoaded();
  const largeFeedRef = useRef<HTMLVideoElement>(null);
  const ownFeedRef = useRef<HTMLVideoElement>(null);
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
      } catch (error: any) {
        if (error?.response?.data?.error_msg === "Token Expired") {
          console.log("Token Expired");
        }
      }
    }
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
        const { peerConnection, remoteStream } = await createPeerConnection();
        setStream("remote1", remoteStream, peerConnection);
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
        {appointmentData?.professionalFullName ? (
          <CallInfo appointmentData={appointmentData} />
        ) : (
          <></>
        )}
        {/* <ChatWindow /> */}
        <div className="absolute bottom-0 w-full bg-gray-800 px-4">
          <ActionButtons ownFeedRef={ownFeedRef} />
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
