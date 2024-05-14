import { Socket } from 'socket.io';

export type AuthPayloadType = {
  username: string;
  user_id: string;
};

export type SocketWithAuth = Socket & AuthPayloadType;

export type OfferType = {
  offererUserName: string;
  offer: RTCSessionDescriptionInit;
  offerIceCandidates: RTCIceCandidate[];
  answererUserName: string;
  answer: any;
  answererIceCandidates: RTCIceCandidate[];
};

export type IceCandidateType = {
  iceCandidate: RTCIceCandidate;
  iceUserName: string;
  didIOffer: boolean;
};

export type ValidateLinkType = {
  token: string;
};
