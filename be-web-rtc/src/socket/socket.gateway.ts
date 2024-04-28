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
import {
  IceCandidateType,
  OfferType,
  SocketWithAuth,
} from 'src/types&enums/types';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);
  private offers: OfferType[] = [];
  constructor() {}

  @WebSocketServer() server: Server;

  afterInit(): void {
    this.logger.debug(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth) {
    if (this.offers.length) {
      setTimeout(() => {
        this.server.emit('availableOffers', this.offers);
      }, 1000);
    }
    this.logger.debug(`Client connected: ${client.username}`);
  }

  async handleDisconnect(client: SocketWithAuth) {
    this.offers = this.offers.filter(
      (offer) => offer.offererUserName !== client.username,
    );
    this.logger.log(`Disconnected socket id: ${client.username}`);
  }

  @SubscribeMessage('newOffer')
  async handleNewOffer(
    client: SocketWithAuth,
    offer: RTCSessionDescriptionInit,
  ) {
    this.offers.push({
      answer: null,
      answererIceCandidates: [],
      answererUserName: null,
      offer: offer,
      offererUserName: client.username,
      offerIceCandidates: [],
    });
    client.broadcast.emit('newOfferAwaiting', this.offers.slice(-1));
  }

  @SubscribeMessage('sendIceCandidateToSignalingServer')
  handleIceCandidate(client: Socket, iceCandidateObj: IceCandidateType) {
    const { didIOffer, iceCandidate, iceUserName } = iceCandidateObj;

    if (didIOffer) {
      const offerInOffers = this.offers.find((o) => {
        return o.offererUserName === iceUserName;
      });
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
      }
    }
  }
}
