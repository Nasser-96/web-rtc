import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import { getDecodeTokenService } from "@/model/services";
import {
  GetValidateDataTokenType,
  ReturnResponseType,
} from "@/types&enums/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CallInfo from "../../components/join-video/call-info";
import ChatWindow from "../../components/join-video/chat-window";
import useVideoStore from "@/stores/video-call-store";
import ActionButtons from "@/components/join-video/action-buttons";

export default function VideoStream() {
  const searchParams = useSearchParams();
  const { isWindow } = useWindowIsLoaded();
  const largeFeedRef = useRef<HTMLVideoElement>(null);
  const ownFeedRef = useRef<HTMLVideoElement>(null);
  const [appointmentData, setAppointmentData] =
    useState<GetValidateDataTokenType>();
  const token = searchParams.get("token");
  const { callState, setCallState } = useVideoStore();

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
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
