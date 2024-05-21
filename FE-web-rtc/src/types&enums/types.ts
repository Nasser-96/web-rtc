import { Socket } from "socket.io-client";
import { AudioVideoStatusEnum, CallStatusEnum, RoleStateEnum } from "./enums";
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
  offerConstraints?: MediaStreamConstraints;
  answerConstraints?: MediaStreamConstraints;
  offerIceCandidates: RTCIceCandidate[];
  answererUserName: string;
  answer: any;
  answererIceCandidates: RTCIceCandidate[];
  callStatus: CallStatusEnum;
};

export type OfferTypeDemo = {
  offererUserName: string;
  offer: RTCSessionDescriptionInit;
  offerShareScreen?: RTCSessionDescriptionInit | undefined;
  offerConstraints?: MediaStreamConstraints;
  answerConstraints?: MediaStreamConstraints;
  offerIceCandidates: RTCIceCandidate[];
  answererUserName: string;
  answer: RTCSessionDescriptionInit;
  answerShareScreen: RTCSessionDescriptionInit;
  answererIceCandidates: RTCIceCandidate[];
  callStatus: CallStatusEnum;
};

export type GetValidateDataTokenType = {
  professionalsFullName: string;
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
  haveCreatedAnswer: boolean;
  offer: RTCSessionDescriptionInit | null;
  answer: RTCSessionDescriptionInit | null;
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

export type CreatePeerConnectionType = {
  mediaStream?: MediaStream;
  didIOfferFun?: boolean;
  offerObj?: OfferTypeDemo;
  isShareScreen?: boolean;
};

export type FetchUserMediaType = {
  stream: MediaStream | undefined;
};
