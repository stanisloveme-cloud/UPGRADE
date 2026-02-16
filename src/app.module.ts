import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { HallsModule } from './halls/halls.module';
import { TracksModule } from './tracks/tracks.module';
import { SessionsModule } from './sessions/sessions.module';
import { SpeakersModule } from './speakers/speakers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api/(.*)'], // Allow API routes to pass through
    }),
    PrismaModule,
    EventsModule,
    HallsModule,
    TracksModule,
    SessionsModule,
    SpeakersModule,
  ],
})
export class AppModule { }
