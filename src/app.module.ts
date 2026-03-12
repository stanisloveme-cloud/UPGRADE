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
import { SessionGuard } from './auth/session.guard';
import { UploadsModule } from './uploads/uploads.module';
import { ExportsModule } from './exports/exports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MarketSegmentsModule } from './market-segments/market-segments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api/{*splat}'], // Fix for path-to-regexp v8 requirements
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
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
    SponsorsModule,
    PrometheusModule.register(),
    MarketSegmentsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: SessionGuard,
    },
  ],
})
export class AppModule { }