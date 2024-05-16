import useWindowIsLoaded from "@/hooks/useIsWindowLoaded";
import useNewSocket from "@/socket/new-socket";
import useCallStore from "@/stores/video-call-store";
import { RoleStateEnum } from "@/types&enums/enums";
import {
  GetValidateDataTokenType,
  OfferTypeJoinVideo,
  ReturnResponseType,
} from "@/types&enums/types";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardProps {
  token: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const { callState, setCallState } = useCallStore();
  const { socket } = useNewSocket("join-video", token);
  const [appointmentData, setAppointmentData] = useState<
    GetValidateDataTokenType[]
  >([]);
  const router = useRouter();
  const { isWindow } = useWindowIsLoaded();

  const joinCall = (appointment: GetValidateDataTokenType) => {
    router.push(
      `/join-video-pro?token=${token}&uuid=${appointment.uuid}&client=${appointment.clientName}`
    );
  };

  useEffect(() => {
    socket?.on("aptData", (data: GetValidateDataTokenType[]) => {
      setAppointmentData(data);
    });
    socket?.on("newOfferWaiting", (data: OfferTypeJoinVideo) => {
      setCallState({
        ...callState,
        offer: data.offer,
        myRole: RoleStateEnum.ANSWERER,
      });
    });
    return () => {
      socket?.off("aptData");
      socket?.off("newOfferWaiting");
    };
  }, [socket]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <div className="bg-slate-700 rounded-xl min-w-96 w-fit min-h-56 p-2">
        <h1 className="text-white">Coming Appointment</h1>
        <div className="flex flex-col gap-3">
          {appointmentData.map((appointment, index) => {
            return (
              <div
                className="flex gap-2 items-center"
                key={`appointments-${index}`}
              >
                <p className="text-teal-300">
                  {appointment.clientName} -{" "}
                  {moment(appointment.appointmentDate).calendar()}{" "}
                </p>
                {appointment.waiting && (
                  <>
                    <p className="text-red-700">Waiting</p>
                    <button
                      onClick={() => joinCall(appointment)}
                      className="px-7 rounded border border-white text-white"
                    >
                      Join
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const token = query.token; // Access the query parameter

  return {
    props: {
      token,
    },
  };
}
