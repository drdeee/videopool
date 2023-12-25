import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MediaService } from './media/media.service';
import { DownloadService } from './download/download.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    MediaService,
    DownloadService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
