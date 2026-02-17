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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api/:path*'], // Allow API routes to pass through
    }),
    PrismaModule,
    EventsModule,
    HallsModule,
    TracksModule,
    SessionsModule,
    SpeakersModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
