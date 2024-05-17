import { GetDevicesHelperType } from "@/types&enums/types";

export const getDevices = async () => {
  return new Promise<GetDevicesHelperType>(async (resolve, reject) => {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    const videoDevices: MediaDeviceInfo[] = devices.filter((device) => {
      return device.kind === "videoinput";
    });
    const audioOutputDevices: MediaDeviceInfo[] = devices.filter((device) => {
      return device.kind === "audiooutput";
    });

    const audioInputDevices: MediaDeviceInfo[] = devices.filter((device) => {
      return device.kind === "audioinput";
    });

    console.log(devices);

    const defaultDevice = audioInputDevices.filter(
      (device) => device.deviceId === "default"
    )[0];

    resolve({
      audioInputDevices,
      audioOutputDevices,
      videoDevices,
      defaultDevice,
    });
  });
};
