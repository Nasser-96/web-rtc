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
  private connectedSockets: SocketWithAuth[] = [];
  constructor() {}

  @WebSocketServer() server: Server;

  afterInit(): void {
    this.logger.debug(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth) {
    this.connectedSockets.push(client);
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
    this.connectedSockets = this.connectedSockets.filter(
      (s) => s.username !== client.username,
    );
    this.logger.log(`Disconnected socket id: ${client.username}`);
  }

  emitToAll(eventName: string, eventData: any) {
    this.server.emit(eventName, eventData);
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
        if (offerInOffers.answererUserName) {
          const socketToSendTo = this.connectedSockets.find(
            (s) => s.username === offerInOffers.answererUserName,
          );
          if (socketToSendTo) {
            socketToSendTo
              .to(socketToSendTo.id)
              .emit('receivedIceCandidateFromServer', iceCandidate);
          } else {
            console.log('Ice Candidate received but could not find answerer');
          }
        }
      }
    } else {
      const offerInOffers = this.offers.find((o) => {
        return o.answererUserName === iceUserName;
      });
      const socketToSendTo = this.connectedSockets.find(
        (s) => s.username === offerInOffers.offererUserName,
      );
      if (socketToSendTo) {
        console.log(socketToSendTo.id);

        this.server
          .to(socketToSendTo.id)
          .emit('receivedIceCandidateFromServer', iceCandidate);
      } else {
        console.log('Ice Candidate received but could not find answerer');
      }
    }
  }

  @SubscribeMessage('newAnswer')
  handleAnswerOffer(client: SocketWithAuth, answerOffer: OfferType) {
    const socketToAnswer = this.connectedSockets.find((socket) => {
      return socket.username === answerOffer.offererUserName;
    });
    if (!socketToAnswer) {
      console.log('No Matching Socket');
      return;
    }

    const socketIdToAnswer = socketToAnswer.id;
    const offerToUpdate = this.offers.find((offer) => {
      return offer.offererUserName === answerOffer.offererUserName;
    });

    if (!offerToUpdate) {
      console.log('No Offer To Update');
      return;
    }

    offerToUpdate.answer = answerOffer.answer;
    offerToUpdate.answererUserName = client.username;

    // socket has a .to() which allow to emitting to a 'room'
    // every socket has it's own room
    console.log(socketIdToAnswer);

    this.server.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
    if (offerToUpdate.offerIceCandidates) {
      return offerToUpdate.offerIceCandidates;
    }
  }
}
