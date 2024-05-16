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
      this.logger.debug(`Client connected: ${client.clientName}`);
    }
  }

  async handleDisconnect(client: JoinVideoAuthWithSocket) {
    this.connectedProfessionals = this.connectedProfessionals.filter(
      (pro) => pro.fullName !== client.fullName,
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
      this.server
        .to(p.id)
        .emit('newOfferWaiting', this.allKnownOffers[appointmentData.uuid]);
      this.server.to(p.id).emit('aptData', data);
    }
  }
}
