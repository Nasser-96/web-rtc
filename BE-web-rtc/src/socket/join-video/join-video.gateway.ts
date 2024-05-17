import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AppService } from 'src/app.service';
import {
  HandleGetIcePayloadType,
  HandleIcePayloadType,
  HandleNewAnswerPayloadType,
  JoinVideoAuthWithSocket,
  JoinVideoNewOfferType,
  OfferTypeJoinVideo,
} from 'src/types&enums/types';

@WebSocketGateway({ cors: true, namespace: 'join-video' })
export class JoinVideoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(JoinVideoGateway.name);
  private allKnownOffers: OfferTypeJoinVideo = {} as OfferTypeJoinVideo;
  private connectedProfessionals: JoinVideoAuthWithSocket[] = [];
  private connectedClients: JoinVideoAuthWithSocket[] = [];
  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;

  afterInit(): void {
    this.logger.debug(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: JoinVideoAuthWithSocket) {
    this.connectedProfessionals.push(client);
    if (client.proId) {
      this.logger.debug(`Client connected: ${client.fullName}`);
      setTimeout(() => {
        this.server.to(client.id).emit(
          'aptData',
          this.appService.professionalAppointments.filter(
            (pa) => pa.professionalsFullName === client.fullName,
          ),
        );
        for (const key in this.allKnownOffers) {
          if (
            this.allKnownOffers[key].professionalsFullName === client.fullName
          ) {
            this.server
              .to(client.id)
              .emit('newOfferWaiting', this.allKnownOffers);
          }
        }
      }, 500);
    } else {
      this.connectedClients.push(client);
      const offerForThisClient = this.allKnownOffers[client.uuid];
      if (offerForThisClient) {
        setTimeout(() => {
          this.server
            .to(client.id)
            .emit('answerToClient', offerForThisClient.answer);
        }, 500);
      }
      this.logger.debug(`Client connected: ${client.clientName}`);
    }
  }

  async handleDisconnect(client: JoinVideoAuthWithSocket) {
    this.connectedProfessionals = this.connectedProfessionals.filter(
      (pro) => pro.fullName !== client.fullName,
    );
    this.connectedClients = this.connectedClients.filter(
      (c) => c.clientName !== client.clientName,
    );
    if (client.proId) {
      this.logger.log(`Disconnected socket id: ${client.fullName}`);
    } else {
      this.logger.log(`Disconnected socket id: ${client.clientName}`);
    }
  }

  emitToAll(eventName: string, eventData: any) {
    this.server.emit(eventName, eventData);
  }

  @SubscribeMessage('newOffer')
  async handleNewOffer(
    client: JoinVideoAuthWithSocket,
    { appointmentData, offer }: JoinVideoNewOfferType,
  ) {
    const p = this.connectedProfessionals.find(
      (cp) => cp?.fullName === appointmentData.professionalsFullName,
    );

    this.allKnownOffers[appointmentData.uuid] = {
      offer,
      offerIceCandidates: [],
      answer: null,
      answererIceCandidates: [],
      appointmentDate: '',
      uniqueId: '',
      clientName: '',
      professionalsFullName: p.fullName,
      appointmentData,
    };

    const pa = this.appService.professionalAppointments.find(
      (pa) => pa.uuid === client.uuid,
    );
    if (pa) {
      pa.waiting = true;
    }

    const data = this.appService.professionalAppointments.filter(
      (pa) =>
        pa.professionalsFullName === appointmentData.professionalsFullName,
    );

    if (p) {
      //only emit if the professional os connected
      client
        .to(p.id)
        .emit('newOfferWaiting', this.allKnownOffers[appointmentData.uuid]);
      client.to(p.id).emit('aptData', data);
    }
  }

  @SubscribeMessage('newAnswer')
  handleNewAnswer(
    client: JoinVideoAuthWithSocket,
    payload: HandleNewAnswerPayloadType,
  ) {
    const socketToSendTo = this.connectedClients.find((c) => {
      return c.uuid === payload.uuid;
    });
    if (socketToSendTo) {
      this.server.to(socketToSendTo.id).emit('answerToClient', payload.answer);
    }

    const knownOffer = this.allKnownOffers[socketToSendTo.uuid];
    if (knownOffer) {
      knownOffer.answer = payload.answer;
    }
  }

  @SubscribeMessage('iceToServer')
  handleIceData(
    client: JoinVideoAuthWithSocket,
    payload: HandleIcePayloadType,
  ) {
    console.log('======================', payload.who);
    const offerToUpdate = this.allKnownOffers[payload.uuid];
    if (offerToUpdate) {
      if (payload.who === 'client') {
        offerToUpdate.offerIceCandidates.push(payload.iceCandidate);
        const socketToSendTo = this.connectedProfessionals.find(
          (cp) => cp.fullName === client.professionalsFullName,
        );
        if (socketToSendTo) {
          client
            .to(socketToSendTo.id)
            .emit('iceToClient', payload.iceCandidate);
        }
      } else if (payload.who === 'professional') {
        offerToUpdate.answererIceCandidates.push(payload.iceCandidate);
        const socketToSendTo = this.connectedClients.find(
          (cp) => cp.uuid === payload.uuid,
        );
        if (socketToSendTo) {
          client
            .to(socketToSendTo.id)
            .emit('iceToClient', payload.iceCandidate);
        }
      }
    }
  }

  @SubscribeMessage('getIce')
  handleGetIceWhenConnect(
    client: JoinVideoAuthWithSocket,
    payload: HandleGetIcePayloadType,
  ) {
    const offer = this.allKnownOffers[payload.uuid];

    if (payload.who === 'professional') {
      return offer.offerIceCandidates;
    } else if (payload.who === 'client') {
      return offer.answererIceCandidates;
    }
  }
}
