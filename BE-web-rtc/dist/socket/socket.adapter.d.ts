import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
export declare class SocketIOAdapter extends IoAdapter {
    private app;
    private server;
    private readonly logger;
    constructor(app: INestApplicationContext);
    createIOServer(port: number, options?: ServerOptions): any;
}
