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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const returnResponse_1 = require("src/helper/returnResponse");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("src/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prismaSirvce, jwtService) {
        this.prismaSirvce = prismaSirvce;
        this.jwtService = jwtService;
    }
    async signup({ username, password }) {
        const userExists = await this.prismaSirvce.user.findUnique({
            where: {
                username,
            },
        });
        if (userExists) {
            throw new common_1.ConflictException((0, returnResponse_1.default)({}, [
                { field: 'username', error: 'Username Already Exists' },
            ]));
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prismaSirvce?.user.create({
            data: {
                username: username,
                password: hashedPassword,
            },
        });
        const token = await this.generateJWT(user?.username, user.id);
        return (0, returnResponse_1.default)({ user_token: token }, '', 'User Created Successfully');
    }
    async generateJWT(username, id) {
        return this.jwtService.signAsync({
            username: username,
            id: id,
        }, { expiresIn: '1000s', secret: process.env.JSON_TOKEN_KEY });
    }
    async login({ username, password }) {
        const getUserByEmail = await this.prismaSirvce.user.findUnique({
            where: {
                username,
            },
        });
        if (!getUserByEmail) {
            throw new common_1.BadGatewayException((0, returnResponse_1.default)({}, 'Username or Password incorrect'));
        }
        const isValidPassword = await bcrypt?.compare(password, getUserByEmail?.password);
        if (getUserByEmail && isValidPassword) {
            const token = await this.generateJWT(getUserByEmail?.username, getUserByEmail?.id);
            return (0, returnResponse_1.default)({ user_token: token, username }, '', '');
        }
        else {
            throw new common_1.BadGatewayException((0, returnResponse_1.default)({}, 'Username or Password incorrect'));
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map