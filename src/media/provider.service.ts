import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { ProviderManager } from 'src/lib/managers';

@Injectable()
export class MediaService {
  private readonly providerManager = new ProviderManager();

  async search(
    query: string,
    { series, movies }: { series: boolean; movies: boolean },
  ) {
    console.log(query, series, typeof series, movies);
    return this.providerManager.search(query, { series, movies });
  }

  async getSerieDetails(serieId: string, providerId: UUID) {
    return this.providerManager.getSerieDetails(serieId, providerId);
  }

  async getMovieDetails(movieId: string, providerId: UUID) {
    return this.providerManager.getMovieDetails(movieId, providerId);
  }
}
