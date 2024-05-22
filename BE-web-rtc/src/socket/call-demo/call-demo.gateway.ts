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
import { CallStatusEnum } from 'src/types&enums/enum';
import {
  HandleNewOfferType,
  IceCandidateType,
  OfferType,
  OfferTypeDemo,
  SocketWithAuth,
} from 'src/types&enums/types';

@WebSocketGateway({ cors: true, namespace: 'call-demo' })
export class CallDemoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CallDemoGateway.name);
  private offers: OfferTypeDemo[] = [];
  private offersShareScreen: OfferTypeDemo[] = [];
  private connectedUsers: string[] = [];
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
      }, 500);
    }
    if (this.offersShareScreen.length) {
      setTimeout(() => {
        this.server.emit('availableOffersShareScreen', this.offersShareScreen);
      }, 500);
    }
    setTimeout(() => {
      this.connectedUsers.push(client.username);
      this.server.emit('connectedUsers', this.connectedUsers);
    }, 500);
    this.logger.debug(`Client connected: ${client.username}`);
  }

  async handleDisconnect(client: SocketWithAuth) {
    this.offers = this.offers.filter(
      (offer) => offer.offererUserName !== client.username,
    );

    this.offersShareScreen = this.offersShareScreen.filter(
      (offer) => offer.offererUserName !== client.username,
    );

    this.connectedSockets = this.connectedSockets.filter(
      (s) => s.username !== client.username,
    );
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user !== client.username,
    );
    const foundMatch = this.offers.find(
      (offer) => offer.answererUserName === client.username,
    );

    const foundMatchShareScreen = this.offersShareScreen.find(
      (offer) => offer.answererUserName === client.username,
    );

    if (foundMatch) {
      if (this.connectedSockets?.find) {
        const offererSocket = {
          ...this.connectedSockets?.find(
            (socket) => socket.username === foundMatch?.offererUserName,
          ),
        };

        this.server
          .to(offererSocket.id)
          .emit('needToReconnect', foundMatch, client.username);
      }
    }

    if (foundMatchShareScreen) {
      if (this.connectedSockets.find) {
        const offererSocket = {
          ...this.connectedSockets?.find(
            (socket) => socket.username === foundMatch?.offererUserName,
          ),
        };

        this.server
          .to(offererSocket.id)
          .emit('needToReconnectShareScreen', foundMatch, client.username);
      }
    }
    this.server.emit('connectedUsers', this.connectedUsers);
    this.logger.log(`Disconnected socket id: ${client.username}`);
  }

  emitToAll(eventName: string, eventData: any) {
    this.server.emit(eventName, eventData);
  }

  @SubscribeMessage('newOffer')
  async handleNewOffer(
    client: SocketWithAuth,
    { user, offer, offerConstraints }: HandleNewOfferType,
  ) {
    const foundMatch = this.offers.find(
      (oldOffer) => oldOffer.answererUserName === user,
    );

    if (foundMatch) {
      foundMatch.offererUserName = client.username;
      foundMatch.offer = offer;
      foundMatch.offerConstraints = offerConstraints;
      foundMatch.callStatus = CallStatusEnum.WAITING;
    } else {
      this.offers.push({
        answer: null,
        answererIceCandidates: [],
        answererUserName: null,
        offer: offer,
        offererUserName: client.username,
        offerIceCandidates: [],
        offerConstraints: offerConstraints,
        callStatus: CallStatusEnum.WAITING,
      });
    }
    const emitTo = this.connectedSockets.find(
      (socket) => socket.username === user,
    );

    client.to(emitTo.id).emit('newOfferAwaiting', this.offers.slice(-1));
  }

  @SubscribeMessage('newOfferShareScreen')
  async handleNewOfferShareScreen(
    client: SocketWithAuth,
    { user, offer, offerConstraints }: HandleNewOfferType,
  ) {
    this.offersShareScreen = this.offersShareScreen.filter(
      (oldOffer) => oldOffer.answererUserName !== user,
    );

    const tempOffer = {
      answer: null,
      answererIceCandidates: [],
      answererUserName: null,
      offererUserName: client.username,
      offerIceCandidates: [],
      offerConstraints: offerConstraints,
      callStatus: CallStatusEnum.WAITING,
      offerShareScreen: offer,
      answerConstraints: {},
      answererIceCandidatesShareScreen: [],
      answerShareScreen: undefined,
      offer: undefined,
      offerIceCandidatesShareScreen: [],
    };

    this.offersShareScreen.push(tempOffer);
    const emitTo = this.connectedSockets.find(
      (socket) => socket.username === user,
    );

    client
      .to(emitTo.id)
      .emit(
        'newOfferAwaitingShareScreen',
        this.offersShareScreen,
        client.username,
      );
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
        this.server
          .to(socketToSendTo.id)
          .emit('receivedIceCandidateFromServer', iceCandidate);
      } else {
        console.log('Ice Candidate received but could not find answerer');
      }
    }
  }

  @SubscribeMessage('sendIceCandidateToSignalingServerShareScreen')
  handleIceCandidateShareScreen(
    client: Socket,
    iceCandidateObj: IceCandidateType,
  ) {
    const { didIOffer, iceCandidate, iceUserName } = iceCandidateObj;
    if (didIOffer) {
      const offerInOffers = this.offersShareScreen.find((o) => {
        return o.offererUserName === iceUserName;
      });
      if (offerInOffers) {
        offerInOffers.offerIceCandidatesShareScreen.push(iceCandidate);
        if (offerInOffers.answererUserName) {
          const socketToSendTo = this.connectedSockets.find(
            (s) => s.username === offerInOffers.answererUserName,
          );
          if (socketToSendTo) {
            socketToSendTo
              .to(socketToSendTo.id)
              .emit('receivedIceCandidateFromServerShareScreen', iceCandidate);
          } else {
            console.log('Ice Candidate received but could not find answerer');
          }
        }
      }
    } else {
      const offerInOffers = this.offersShareScreen.find((o) => {
        return o.answererUserName === iceUserName;
      });
      const socketToSendTo = this.connectedSockets.find(
        (s) => s.username === offerInOffers.offererUserName,
      );
      if (socketToSendTo) {
        this.server
          .to(socketToSendTo.id)
          .emit('receivedIceCandidateFromServerShareScreen', iceCandidate);
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
    offerToUpdate.answerConstraints = answerOffer.answerConstraints;
    offerToUpdate.callStatus = CallStatusEnum.IN_CALL;

    // socket has a .to() which allow to emitting to a 'room'
    // every socket has it's own room
    if (answerOffer.callStatus !== CallStatusEnum.IN_CALL) {
      this.server.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
    }

    if (offerToUpdate.offerIceCandidates) {
      return offerToUpdate.offerIceCandidates;
    }
  }

  @SubscribeMessage('newAnswerShareScreen')
  handleAnswerOfferShareScreen(client: SocketWithAuth, answerOffer: OfferType) {
    const socketToAnswer = this.connectedSockets.find((socket) => {
      return socket.username === answerOffer.offererUserName;
    });
    if (!socketToAnswer) {
      console.log('No Matching Socket');
      return;
    }

    const socketIdToAnswer = socketToAnswer.id;
    const offerToUpdate = this.offersShareScreen.find((offer) => {
      return offer.offererUserName === answerOffer.offererUserName;
    });

    if (!offerToUpdate) {
      console.log('No Offer To Update');
      return;
    }

    offerToUpdate.answerShareScreen = answerOffer.answerShareScreen;
    offerToUpdate.answererUserName = client.username;
    offerToUpdate.answerConstraints = answerOffer.answerConstraints;
    offerToUpdate.callStatus = CallStatusEnum.IN_CALL;

    // socket has a .to() which allow to emitting to a 'room'
    // every socket has it's own room
    if (answerOffer.callStatus !== CallStatusEnum.IN_CALL) {
      this.server
        .to(socketIdToAnswer)
        .emit('answerResponseShareScreen', offerToUpdate);
    }

    if (offerToUpdate.offerIceCandidatesShareScreen) {
      return offerToUpdate.offerIceCandidatesShareScreen;
    }
  }
}
