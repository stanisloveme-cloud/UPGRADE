import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['auth/{*path}', 'metrics'] });

  // Initialize Redis Client
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  redisClient.connect().catch(console.error);

  // Initialize Redis Session Store
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'upgrade:',
  });

  // Bind Express Session
  app.use(
    session({
      store: redisStore,
      secret: process.env.JWT_SECRET || 'complex_secret_value_change_me_in_prod',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('UPGRADE CRM API')
    .setDescription('API documentation for UPGRADE CRM')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
  
  writeFileSync('./openapi.json', JSON.stringify(document));
  console.log('Swagger openapi.json generated successfully.');

  // Disable full boot to avoid DB timeouts during Code Gen
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();