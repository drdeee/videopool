import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import axios from 'axios';
import { UUID } from 'crypto';
import { ProviderManager } from 'src/lib/managers';

@Injectable()
export class MediaService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  onApplicationBootstrap() {
    if (process.env.CLOUDFLARE_BYPASS === 'TRUE')
      axios.post('http://localhost:8191/v1', {
        cmd: 'sessions.create',
        session: 's.to',
      });
  }
  onApplicationShutdown() {
    if (process.env.CLOUDFLARE_BYPASS === 'TRUE')
      axios.post('http://localhost:8191/v1', {
        cmd: 'sessions.destroy',
        session: 's.to',
      });
  }
  private readonly providerManager = new ProviderManager();

  async search(
    query: string,
    { series, movies }: { series: boolean; movies: boolean },
  ) {
    return this.providerManager.search(query, { series, movies });
  }

  async getSerieDetails(serieId: string, providerId: UUID) {
    return this.providerManager.getSerieDetails(serieId, providerId);
  }

  async getSeason(seasonId: string, providerId: UUID) {
    return this.providerManager.getSeason(seasonId, providerId);
  }

  async getEpisode(episodeId: string, providerId: UUID) {
    return this.providerManager.getEpisode(episodeId, providerId);
  }

  async getMovieDetails(movieId: string, providerId: UUID) {
    return this.providerManager.getMovieDetails(movieId, providerId);
  }

  getMetadata() {
    return this.providerManager.getProviders().map((provider) => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
    }));
  }
}
