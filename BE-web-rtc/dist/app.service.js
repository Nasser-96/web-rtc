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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const returnResponse_1 = require("./helper/returnResponse");
const prisma_service_1 = require("./prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const front_end_url_1 = require("./helper/front-end-url");
const socket_gateway_1 = require("./socket/socket.gateway");
let AppService = class AppService {
    constructor(prismaService, jwtService, eventsGateway) {
        this.prismaService = prismaService;
        this.jwtService = jwtService;
        this.eventsGateway = eventsGateway;
        this.linkSecret = 'djgbosubauldsnlfnadogubeuigs';
    }
    getHello() {
        return 'Hello World!';
    }
    async getAllUsers() {
        const users = await this.prismaService.user.findMany();
        return (0, returnResponse_1.default)(users);
    }
    async getUserLink() {
        const appData = {
            professionalFullName: 'Mark John Doe',
            appointmentDate: Date.now() + 1000000,
        };
        const linkToken = this.jwtService.sign(appData, {
            secret: this.linkSecret,
        });
        return (0, returnResponse_1.default)({
            link: `${(0, front_end_url_1.default)()}/join-video?token=${linkToken}`,
        });
    }
    async validateLink(data) {
        try {
            const decodedData = this.jwtService.verify(data.token, {
                secret: this.linkSecret,
            });
            return (0, returnResponse_1.default)(decodedData);
        }
        catch (error) {
            throw new common_1.HttpException((0, returnResponse_1.default)('', 'Token Expired'), common_1.HttpStatus.METHOD_NOT_ALLOWED);
        }
    }
    socket() {
        this.eventsGateway.emitToAll('test', (0, returnResponse_1.default)({ data: 'GGs' }));
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, socket_gateway_1.AppGateway])
], AppService);
//# sourceMappingURL=app.service.js.map