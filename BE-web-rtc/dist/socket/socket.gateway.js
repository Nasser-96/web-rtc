"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let AppGateway = AppGateway_1 = class AppGateway {
    constructor() {
        this.logger = new common_1.Logger(AppGateway_1.name);
        this.offers = [];
        this.connectedSockets = [];
    }
    afterInit() {
        this.logger.debug(`Websocket Gateway initialized.`);
    }
    async handleConnection(client) {
        this.connectedSockets.push(client);
        if (this.offers.length) {
            setTimeout(() => {
                this.server.emit('availableOffers', this.offers);
            }, 1000);
        }
        this.logger.debug(`Client connected: ${client.username}`);
    }
    async handleDisconnect(client) {
        this.offers = this.offers.filter((offer) => offer.offererUserName !== client.username);
        this.connectedSockets = this.connectedSockets.filter((s) => s.username !== client.username);
        this.logger.log(`Disconnected socket id: ${client.username}`);
    }
    emitToAll(eventName, eventData) {
        this.server.emit(eventName, eventData);
    }
    async handleNewOffer(client, offer) {
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
    handleIceCandidate(client, iceCandidateObj) {
        const { didIOffer, iceCandidate, iceUserName } = iceCandidateObj;
        if (didIOffer) {
            const offerInOffers = this.offers.find((o) => {
                return o.offererUserName === iceUserName;
            });
            if (offerInOffers) {
                offerInOffers.offerIceCandidates.push(iceCandidate);
                if (offerInOffers.answererUserName) {
                    const socketToSendTo = this.connectedSockets.find((s) => s.username === offerInOffers.answererUserName);
                    if (socketToSendTo) {
                        socketToSendTo
                            .to(socketToSendTo.id)
                            .emit('receivedIceCandidateFromServer', iceCandidate);
                    }
                    else {
                        console.log('Ice Candidate received but could not find answerer');
                    }
                }
            }
        }
        else {
            const offerInOffers = this.offers.find((o) => {
                return o.answererUserName === iceUserName;
            });
            const socketToSendTo = this.connectedSockets.find((s) => s.username === offerInOffers.offererUserName);
            if (socketToSendTo) {
                console.log(socketToSendTo.id);
                this.server
                    .to(socketToSendTo.id)
                    .emit('receivedIceCandidateFromServer', iceCandidate);
            }
            else {
                console.log('Ice Candidate received but could not find answerer');
            }
        }
    }
    handleAnswerOffer(client, answerOffer) {
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
        console.log(socketIdToAnswer);
        this.server.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
        if (offerToUpdate.offerIceCandidates) {
            return offerToUpdate.offerIceCandidates;
        }
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('newOffer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleNewOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendIceCandidateToSignalingServer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newAnswer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleAnswerOffer", null);
exports.AppGateway = AppGateway = AppGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [])
], AppGateway);
//# sourceMappingURL=socket.gateway.js.map