import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { JoinVideoAuthWithSocket, SocketWithAuth } from 'src/types&enums/types';

export class JoinVideoIOAdapter extends IoAdapter {
  private server: Server | null = null;
  private readonly logger = new Logger(JoinVideoIOAdapter.name);
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    this.server = super.createIOServer(port, options);

    const jwtService = this.app.get(JwtService);
    this.server
      .of('/join-video')
      .use(createTokenMiddleware(jwtService, this.logger));
    return this.server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: JoinVideoAuthWithSocket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    try {
      const payload = jwtService.verify(token, {
        secret: process.env.JSON_TOKEN_KEY,
      });
      if (payload.proId) {
        socket.proId = payload.proId;
        socket.fullName = payload.fullName;
      } else {
        socket.professionalsFullName = payload.professionalsFullName;
        socket.appointmentDate = payload.appointmentDate;
        socket.uuid = payload.uuid;
        socket.clientName = payload.clientName;
      }

      next();
    } catch (error) {
      console.log(error);

      next(new Error('Invalid token'));
    }
  };
