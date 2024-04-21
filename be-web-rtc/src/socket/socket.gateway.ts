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
import ReturnResponse, { ReturnResponseType } from '../helper/returnResponse';
import { SocketWithAuth } from 'src/types&enums/types';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);
  constructor() {}

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

  @SubscribeMessage('messageFromClient')
  async handleMessage(client: SocketWithAuth, payload: any) {}

  @SubscribeMessage('updateNamespaces')
  handleUpdateNamespace(client: Socket, namespace: string) {}
}
