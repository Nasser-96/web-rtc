import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from 'src/app.service';
import {
  IceCandidateType,
  OfferTypeJoinVideo,
  SocketWithAuth,
} from 'src/types&enums/types';

@WebSocketGateway({ cors: true, namespace: 'join-video' })
export class JoinVideoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(JoinVideoGateway.name);
  private allKnownOffers: OfferTypeJoinVideo = {} as OfferTypeJoinVideo;
  private connectedSockets: SocketWithAuth[] = [];
  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;

  afterInit(): void {
    this.logger.debug(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth) {
    this.logger.debug(`Client connected: ${client.username}`);
  }

  async handleDisconnect(client: SocketWithAuth) {
    this.logger.log(`Disconnected socket id: ${client.username}`);
  }

  emitToAll(eventName: string, eventData: any) {
    this.server.emit(eventName, eventData);
  }

  @SubscribeMessage('newOffer')
  async handleNewOffer(client: SocketWithAuth) {}
}
