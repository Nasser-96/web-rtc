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
        {appointmentData && (
          <div className="absolute top-1/2 left-[40%] border border-slate-400 bg-slate-800 p-2 text-3xl">
            <h1 className="text-white">
              {appointmentData.professionalFullName} has been notified.
            </h1>
            <h1 className="text-white mt-2">
              {/* Your Appointment is {momentText}. */}
            </h1>
          </div>
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
