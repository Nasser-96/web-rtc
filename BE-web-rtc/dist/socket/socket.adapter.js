"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOAdapter = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SocketIOAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app) {
        super(app);
        this.app = app;
        this.server = null;
        this.logger = new common_1.Logger(SocketIOAdapter.name);
    }
    createIOServer(port, options) {
        this.server = super.createIOServer(port, options);
        const jwtService = this.app.get(jwt_1.JwtService);
        this.server.of('/').use(createTokenMiddleware(jwtService, this.logger));
        return this.server;
    }
}
exports.SocketIOAdapter = SocketIOAdapter;
const createTokenMiddleware = (jwtService, logger) => (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    try {
        const payload = jwtService.verify(token, {
            secret: process.env.JSON_TOKEN_KEY,
        });
        socket.user_id = payload.id;
        socket.username = payload.username;
        next();
    }
    catch (error) {
        next(new Error('Invalid token'));
    }
};
//# sourceMappingURL=socket.adapter.js.map