import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
interface SignupParams {
    password: string;
    username: string;
}
interface LoginParams {
    password: string;
    username: string;
}
export declare class AuthService {
    private readonly prismaSirvce;
    private jwtService;
    constructor(prismaSirvce: PrismaService, jwtService: JwtService);
    signup({ username, password }: SignupParams): Promise<{
        is_successful: boolean;
        response: any;
        error_msg: any;
        success: string;
    }>;
    private generateJWT;
    login({ username, password }: LoginParams): Promise<{
        is_successful: boolean;
        response: any;
        error_msg: any;
        success: string;
    }>;
}
export {};
