import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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

  // Increase payload limit for large legacy JSON imports
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();