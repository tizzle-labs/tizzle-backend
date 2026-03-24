import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const apiPrefix = configService.get<string>('app.apiPrefix');

  // Global prefix (exclude health check endpoints)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', '/'],
  });

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tizzle API')
    .setDescription('Refundable Staking Ticketing Protocol on Solana')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Wallet authentication endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Organizations', 'Organization management')
    .addTag('Events', 'Event management')
    .addTag('Registrations', 'Event registration management')
    .addTag('Badges', 'Badge system')
    .addTag('Analytics', 'Analytics and metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  logger.log(`🌐 Network: ${configService.get('solana.network')}`);
}

bootstrap();
