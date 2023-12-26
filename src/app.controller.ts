import { Controller, Get, Query } from '@nestjs/common';
import {
  IMovie,
  ISerieDetails,
  IMedia,
  ISerie,
  ISeason,
  IEpisode,
} from './lib/types';
import { MediaService } from './media/media.service';
import { UUID } from 'crypto';
import { DownloadService } from './download/download.service';

@Controller()
export class AppController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly downloadService: DownloadService,
  ) {}

  @Get('/search')
  async search(
    @Query('query') query: string,
    @Query('series')
    searchSeries: boolean = true,
    @Query('movies')
    searchMovies: boolean = true,
  ): Promise<{
    series: ISerie[] | null;
    movies: IMovie[] | null;
  }> {
    return await this.mediaService.search(query, {
      series: searchSeries,
      movies: searchMovies,
    });
  }

  @Get('/serie/info')
  async getSerie(
    @Query('id') serieId: string,
    @Query('provider') providerId: UUID,
  ): Promise<ISerieDetails> {
    return await this.mediaService.getSerieDetails(serieId, providerId);
  }

  @Get('/serie/season')
  async getSeason(
    @Query('id') seasonId: string,
    @Query('provider') providerId: UUID,
  ): Promise<ISeason> {
    return await this.mediaService.getSeason(seasonId, providerId);
  }

  @Get('/serie/episode')
  async getEpisode(
    @Query('id') episodeId: string,
    @Query('provider') providerId: UUID,
  ): Promise<IEpisode> {
    return await this.mediaService.getEpisode(episodeId, providerId);
  }

  @Get('/movie')
  async getMovie(
    @Query('id') movieId: string,
    @Query('provider') providerId: UUID,
  ): Promise<IMovie> {
    return await this.mediaService.getMovieDetails(movieId, providerId);
  }

  @Get('/download')
  async getDownloadInfo(
    @Query('source') source: string,
    @Query('host') hostId: UUID,
  ): Promise<IMedia> {
    return await this.downloadService.getDownloadInformation(source, hostId);
  }

  @Get('/meta')
  getMetadata() {
    return {
      providers: this.mediaService.getMetadata(),
      hosts: this.downloadService.getMetadata(),
    };
  }
}
