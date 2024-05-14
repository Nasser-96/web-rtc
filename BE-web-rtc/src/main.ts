import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { ValidationError } from 'class-validator';
import { SocketIOAdapter } from './socket/socket.adapter';
import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

async function bootstrap() {
  const httpsOptions: HttpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'nasser',
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        throw new BadRequestException(
          ReturnResponse(
            {},
            validationErrors?.map((error) => ({
              field: error?.property,
              error: Object?.values(error?.constraints)?.join(', '),
            })),
            '',
          ),
        );
      },
    }),
  );

  const socketAdapter = new SocketIOAdapter(app);
  app.useWebSocketAdapter(socketAdapter);

  await app.listen(9000);
}

bootstrap();
