import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { ValidationError } from 'class-validator';
import { SocketIOAdapter } from './socket/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
