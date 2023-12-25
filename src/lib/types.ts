import { UUID } from 'crypto';

// GENERAL
export interface IProvider {
  id: UUID;
  name: string;
  type: 'serie' | 'movie' | 'general';
}

export interface IGeneralProvider extends IProvider {
  search: (
    query: string,
    options: { series: boolean; movies: boolean },
  ) => Promise<{ series: ISerie[]; movies: IMovie[] }>;
}

export type MediaType = 'hls' | 'mp4';

export interface IHost {
  id: UUID;
  name: string;
  isSupported: boolean;

  mediaType: MediaType;

  getMedia(hostMedia: IHostMedia): Promise<IMedia>;
}

export interface IHostMedia {
  hostId: UUID;
  source: string;
}

export interface IMedia {
  source: string;
  type: MediaType;
  headers?: Record<string, string>;
}

// SERIES

export interface ISerie {
  id: string;
  provider: UUID;
  name: string;
  description: string;
}

export interface ISerieDetails extends ISerie {
  imageUrl: string;
  seasons: ISeason[];
}

export interface ISeason {
  id: string;
  provider: UUID;
  number: number;
  episodesLoaded: boolean;
  episodes?: IEpisodeInfo[];
}

export interface IEpisodeInfo {
  id: string;
  provider: UUID;
  languages: string[];
  hosts: string[];
}

export interface IEpisode extends Omit<IEpisodeInfo, 'languages' | 'hosts'> {
  sources: {
    language: string;
    hosts: IHostMedia[];
  }[];
}

export interface ISerieProvider extends IProvider {
  type: 'serie';

  searchSerie(query: string): Promise<ISerie[]>;
  retrieveSerieDetails(
    serieId: string,
    options?: ISerieRetrievalOptions,
  ): Promise<ISerieDetails>;
  retrieveSeason(seasonId: string): Promise<ISeason>;
  retrieveEpisode(episodeId: string): Promise<IEpisode>;
}

export interface ISerieRetrievalOptions {
  loadSeasonsComplete?: boolean;
}

// MOVIES

export interface IMovie {
  id: string;
  provider: UUID;
  name: string;
  description?: string;
  year?: number;
  imageUrl?: string;
}

export interface IMovieDetails extends IMovie {
  sources: { language: string; hosts: IHostMedia[] }[];
}

export interface IMovieProvider extends IProvider {
  type: 'movie';

  searchMovie(query: string): Promise<IMovie[]>;
  retrieveMovieDetails(movieId: string): Promise<IMovieDetails>;
}
