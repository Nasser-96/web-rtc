import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ValidateLinkType } from './types&enums/types';
import { AppGateway } from './socket/socket.gateway';
export declare class AppService {
    private readonly prismaService;
    private jwtService;
    private readonly eventsGateway;
    constructor(prismaService: PrismaService, jwtService: JwtService, eventsGateway: AppGateway);
    private linkSecret;
    getHello(): string;
    getAllUsers(): Promise<{
        is_successful: boolean;
        response: any;
        error_msg: any;
        success: string;
    }>;
    getUserLink(): Promise<{
        is_successful: boolean;
        response: any;
        error_msg: any;
        success: string;
    }>;
    validateLink(data: ValidateLinkType): Promise<{
        is_successful: boolean;
        response: any;
        error_msg: any;
        success: string;
    }>;
    socket(): void;
}
