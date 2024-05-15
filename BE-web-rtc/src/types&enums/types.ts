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

export type OfferTypeJoinVideo = {
  uniqueId: string;
  offer: RTCSessionDescriptionInit;
  professionalFullName: string[];
  clientName: string;
  appointmentDate: string;
  offerIceCandidates: RTCIceCandidate[];
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

export type AppointmentType = {
  professionalFullName: string;
  appointmentDate: number;
  uuid: string;
};
