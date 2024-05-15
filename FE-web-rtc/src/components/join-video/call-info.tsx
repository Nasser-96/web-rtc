import { GetValidateDataTokenType } from "@/types&enums/types";
import moment from "moment";
import { useEffect, useState } from "react";

interface CallInfoProps {
  appointmentData: GetValidateDataTokenType;
}

export default function CallInfo({ appointmentData }: CallInfoProps) {
  const [momentText, setMomentText] = useState(
    moment(appointmentData.appointmentDate).fromNow()
  );

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setMomentText(moment(appointmentData.appointmentDate).fromNow());
      // console.log("Updating time");
    }, 5000);
    return () => {
      // console.log("Clearing");
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="absolute top-1/2 left-[40%] border border-slate-400 bg-slate-800 p-2 text-3xl">
      <h1 className="text-white">
        {appointmentData.professionalFullName} has been notified.
      </h1>
      <h1 className="text-white mt-2">Your Appointment is {momentText}.</h1>
    </div>
  );
}
