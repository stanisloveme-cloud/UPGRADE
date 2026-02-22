import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { HallsModule } from './halls/halls.module';
import { TracksModule } from './tracks/tracks.module';
import { SessionsModule } from './sessions/sessions.module';
import { SpeakersModule } from './speakers/speakers.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UploadsModule } from './uploads/uploads.module';
import { ExportsModule } from './exports/exports.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api/(.*)', '/uploads/(.*)'], // Allow API and uploads routes to pass through
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    EventsModule,
    HallsModule,
    TracksModule,
    SessionsModule,
    SpeakersModule,
    AuthModule,
    UsersModule,
    UploadsModule,
    ExportsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
