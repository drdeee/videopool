import { UUID } from 'crypto';
import {
  IGeneralProvider,
  IHost,
  IMovie,
  IMovieProvider,
  IProvider,
  ISerie,
  ISerieProvider,
} from './types';
import { VOEHost } from './hosts/voe';
import { StreamtapeHost } from './hosts/streamtape';
import { VidozaHost } from './hosts/vidoza';
import { StreamWishHost } from './hosts/streamwish';
import { DoodStreamHost } from './hosts/doodstream';
import { FileLionsHost } from './hosts/filelions';
import { CinemathekProvider } from './providers/cinemathek';
import { SerienstreamProvider } from './providers/serienstream';

const UNKOWN_HOST: UUID = '1036b3cb-44d9-4da5-b863-33b3584e7b05';
export class HostManager {
  private hosts: Map<UUID, IHost> = new Map();
  private nameMapping: Map<string, UUID> = new Map();

  constructor() {
    this.registerHost(new VOEHost());
    this.registerHost(new DoodStreamHost());
    this.registerHost(new StreamtapeHost());
    this.registerHost(new VidozaHost());
    this.registerHost(new StreamWishHost());
    this.registerHost(new FileLionsHost());
  }

  private registerHost(host: IHost) {
    this.hosts.set(host.id, host);
    this.nameMapping.set(host.name.toLowerCase(), host.id);
  }

  getHostId(name: string): UUID {
    return this.nameMapping.get(name.toLowerCase()) || UNKOWN_HOST;
  }

  getHost(id: UUID): IHost | undefined {
    return this.hosts.get(id) || undefined;
  }
}

export const hostManager = new HostManager();

export class ProviderManager {
  private providers: Map<UUID, IProvider> = new Map();

  constructor() {
    this.registerProvider(new CinemathekProvider());
    this.registerProvider(new SerienstreamProvider());
  }

  private registerProvider(provider: IProvider) {
    this.providers.set(provider.id, provider);
  }

  async search(
    query: string,
    {
      series: searchSeries,
      movies: searchMovies,
    }: { series: boolean; movies: boolean } = { series: true, movies: true },
  ): Promise<{ series: ISerie[] | null; movies: IMovie[] | null }> {
    const series: ISerie[] = [];
    const movies: IMovie[] = [];
    await Promise.all(
      Array.from(this.providers.values()).map(async (provider) => {
        switch (provider.type) {
          case 'serie':
            if (searchSeries) {
              series.push(
                ...(await (provider as ISerieProvider).searchSerie(query)),
              );
            }
            break;
          case 'movie':
            if (searchMovies) {
              movies.push(
                ...(await (provider as IMovieProvider).searchMovie(query)),
              );
            }
            break;
          case 'general':
            const results = await (provider as IGeneralProvider).search(query, {
              series: searchSeries,
              movies: searchMovies,
            });
            series.push(...results.series);
            movies.push(...results.movies);
        }
      }),
    );
    return {
      series: series.length > 0 ? series : null,
      movies: movies.length > 0 ? movies : null,
    };
  }

  async getSerieDetails(serieId: string, providerId: UUID) {
    const provider = this.providers.get(providerId);
    if (provider?.type === 'serie' || provider?.type === 'general') {
      return (provider as ISerieProvider).retrieveSerieDetails(serieId);
    }
  }

  async getSeason(seasonId: string, providerId: UUID) {
    const provider = this.providers.get(providerId);
    if (provider?.type === 'serie' || provider?.type === 'general') {
      return (provider as ISerieProvider).retrieveSeason(seasonId);
    }
  }

  async getEpisode(episodeId: string, providerId: UUID) {
    const provider = this.providers.get(providerId);
    if (provider?.type === 'serie' || provider?.type === 'general') {
      return (provider as ISerieProvider).retrieveEpisode(episodeId);
    }
  }

  async getMovieDetails(movieId: string, providerId: UUID) {
    const provider = this.providers.get(providerId);
    if (provider?.type === 'movie' || provider?.type === 'general') {
      return (provider as IMovieProvider).retrieveMovieDetails(movieId);
    }
  }
}

export const providerManager = new ProviderManager();
