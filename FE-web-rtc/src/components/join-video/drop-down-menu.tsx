import ActionButton from "@/components/shared/action-button";
import useStreamStore from "@/stores/stream-store";
import useCallStore from "@/stores/video-call-store";
import { AudioVideoStatusEnum } from "@/types&enums/enums";
import { RefObject, useEffect, useState } from "react";

interface DropDownMenuProps {
  deviceList: MediaDeviceInfo[];
  isAudio?: boolean;
  onClick: (value: any) => void;
}

export default function DropDownMenu({
  deviceList,
  isAudio,
  onClick,
}: DropDownMenuProps) {
  const [audioInput, setAudioInput] = useState<MediaDeviceInfo[]>([]);
  const [audioOutput, setAudioOutput] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (isAudio) {
      const tempOutput: MediaDeviceInfo[] = [];
      const tempInput: MediaDeviceInfo[] = [];
      deviceList.forEach((device) => {
        if (device.kind === "audioinput") {
          tempInput.push(device);
        } else if (device.kind === "audiooutput") {
          tempOutput.push(device);
        }
      });
      setAudioOutput(tempOutput);
      setAudioInput(tempInput);
    }
  }, [deviceList]);

  return (
    <div className="absolute bottom-full bg-slate-900 flex flex-col gap-2 w-fit p-2 flex-nowrap">
      {isAudio ? (
        <>
          <p className="text-white">Input Devices</p>
          {audioInput.map((device) => {
            return (
              <ActionButton
                key={`video-device-input-${device.deviceId}`}
                className="w-full text-white border whitespace-nowrap p-2 rounded"
                text={device.label}
                onClick={() => onClick(device)}
              />
            );
          })}
          <p className="text-white">Output Devices</p>
          {audioOutput.map((device) => {
            return (
              <ActionButton
                key={`video-device-input-${device.deviceId}`}
                className="w-full text-white border whitespace-nowrap p-2 rounded"
                text={device.label}
                onClick={() => onClick(device)}
              />
            );
          })}
        </>
      ) : (
        deviceList.map((device) => {
          return (
            <ActionButton
              key={`video-device-input-${device.deviceId}`}
              className="w-full text-white border whitespace-nowrap p-2 rounded"
              text={device.label}
              onClick={() => onClick(device)}
            />
          );
        })
      )}
    </div>
  );
}
