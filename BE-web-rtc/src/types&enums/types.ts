import { Socket } from 'socket.io';

export type AuthPayloadType = {
  username: string;
  user_id: string;
};

export type JoinVideoAuth = {
  fullName?: string;
  proId?: string;
  professionalsFullName?: string;
  appointmentDate?: number;
  uuid?: string;
  clientName?: string;
};

export type SocketWithAuth = Socket & AuthPayloadType;

export type JoinVideoAuthWithSocket = JoinVideoAuth & Socket;

export type OfferType = {
  offererUserName: string;
  offer: RTCSessionDescriptionInit;
  offerIceCandidates: RTCIceCandidate[];
  answererUserName: string;
  answer: any;
  answererIceCandidates: RTCIceCandidate[];
};

export type OfferTypeJoinVideo = {
  [uuid: string]: {
    uniqueId: string;
    offer: RTCSessionDescriptionInit;
    professionalsFullName: string;
    clientName: string;
    appointmentDate: string;
    offerIceCandidates: RTCIceCandidate[];
    answer: any;
    answererIceCandidates: RTCIceCandidate[];
    appointmentData: AppointmentType;
  };
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
  professionalsFullName: string;
  appointmentDate: number;
  uuid: string;
  clientName: string;
  waiting?: boolean;
};

export type JoinVideoNewOfferType = {
  offer: RTCSessionDescriptionInit;
  appointmentData: AppointmentType;
};

export type HandleNewAnswerPayloadType = {
  answer: RTCSessionDescriptionInit;
  uuid: string;
};

export type HandleIcePayloadType = {
  iceCandidate: RTCIceCandidate;
  who: 'professional' | 'client';
  uuid: string;
};

export type HandleGetIcePayloadType = {
  who: 'professional' | 'client';
  uuid: string;
};
