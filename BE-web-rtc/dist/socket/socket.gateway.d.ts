import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IceCandidateType, OfferType, SocketWithAuth } from 'src/types&enums/types';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    private offers;
    private connectedSockets;
    constructor();
    server: Server;
    afterInit(): void;
    handleConnection(client: SocketWithAuth): Promise<void>;
    handleDisconnect(client: SocketWithAuth): Promise<void>;
    emitToAll(eventName: string, eventData: any): void;
    handleNewOffer(client: SocketWithAuth, offer: RTCSessionDescriptionInit): Promise<void>;
    handleIceCandidate(client: Socket, iceCandidateObj: IceCandidateType): void;
    handleAnswerOffer(client: SocketWithAuth, answerOffer: OfferType): RTCIceCandidate[];
}
