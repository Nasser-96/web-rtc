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
