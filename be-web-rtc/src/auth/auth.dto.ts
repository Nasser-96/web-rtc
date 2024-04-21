import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator"

export class SignupDto
{
    @IsString()
    @IsNotEmpty()
    username:string       

    @IsString()
    @MinLength(5)
    password:string
}

export class Login
{
    @IsString()
    @IsNotEmpty()
    username:string       

    @IsString()
    @MinLength(5)
    password:string
}