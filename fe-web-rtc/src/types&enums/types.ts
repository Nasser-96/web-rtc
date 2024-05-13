import { Socket } from "socket.io-client";

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
  appointmentDate: number;
};

export type VideoCallDataStoreType = {
  current: string;
  video: boolean;
  audio: boolean;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  haveMedia: boolean;
};
