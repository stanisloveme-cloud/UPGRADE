import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('UPGRADE CRM API')
    .setDescription('API documentation for UPGRADE CRM')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./openapi.json', JSON.stringify(document));
  console.log('Swagger openapi.json generated successfully.');
  process.exit(0);
}
bootstrap();
