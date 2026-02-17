import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api', { exclude: ['auth/{*path}'] }); // Updated to use wildcard syntax
  // Actually, wait, the legacy system didn't use /api prefix for everything. 
  // Let's just enable CORS.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
