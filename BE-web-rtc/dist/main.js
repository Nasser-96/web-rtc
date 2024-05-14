"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const returnResponse_1 = require("./helper/returnResponse");
const socket_adapter_1 = require("./socket/socket.adapter");
const fs = require("fs");
async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
        passphrase: 'nasser',
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (validationErrors = []) => {
            throw new common_1.BadRequestException((0, returnResponse_1.default)({}, validationErrors?.map((error) => ({
                field: error?.property,
                error: Object?.values(error?.constraints)?.join(', '),
            })), ''));
        },
    }));
    const socketAdapter = new socket_adapter_1.SocketIOAdapter(app);
    app.useWebSocketAdapter(socketAdapter);
    await app.listen(9000);
}
bootstrap();
//# sourceMappingURL=main.js.map