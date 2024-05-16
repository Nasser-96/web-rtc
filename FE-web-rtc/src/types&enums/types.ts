import { Socket } from "socket.io-client";
import { AudioVideoStatusEnum, RoleStateEnum } from "./enums";
import { RefObject } from "react";

export interface Prefs {
  token: string;
}

export type NameSpaces = {
  endpoint: string;
  id: string;
  image: string;
  name: string;
  rooms: RoomsForNameSpaces[];
};

export type ReturnResponseType<T> = {
  is_successful: boolean;
  error_msg: string;
  success: string;
  response: T;
};

export type RoomsForNameSpaces = {
  namespaceId: number;
  privateRoom: boolean;
  roomId: number;
  roomTitle: string;
  history: string[];
};

export type JoinRoomResponse = { namespaces: NameSpaces[] } & {
  count: number;
};

export type LocalStorageUserDataType = {
  token?: string;
  username?: string;
};

export type OfferType = {
  offererUserName: string;
  offer: RTCSessionDescriptionInit;
  offerIceCandidates: RTCIceCandidate[];
  answererUserName: string;
  answer: any;
  answererIceCandidates: RTCIceCandidate[];
};

export type GetValidateDataTokenType = {
  professionalFullName: string;
  appointmentDate: string;
  uuid: string;
  id?: string;
  username?: string;
  clientName: string;
  waiting?: boolean;
};

export type VideoCallDataStoreType = {
  current: string;
  video: AudioVideoStatusEnum;
  audio: AudioVideoStatusEnum;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  haveMedia: boolean;
  haveCreatedOffer: boolean;
  offer: RTCSessionDescriptionInit | null;
  myRole: RoleStateEnum | "";
};

export type GetDevicesHelperType = {
  videoDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  audioInputDevices: MediaDeviceInfo[];
  defaultDevice: MediaDeviceInfo;
};

export interface HTMLVideoElementWithSinkId extends HTMLVideoElement {
  setSinkId?(sinkId: string): Promise<void>;
}

export type OfferTypeJoinVideo = {
  uniqueId: string;
  offer: RTCSessionDescriptionInit;
  professionalsFullName: string;
  clientName: string;
  appointmentDate: string;
  offerIceCandidates: RTCIceCandidate[];
  answer: any;
  answererIceCandidates: RTCIceCandidate[];
  appointmentData: GetValidateDataTokenType;
};
