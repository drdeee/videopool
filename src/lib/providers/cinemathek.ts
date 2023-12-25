import { UUID } from 'crypto';
import { IHostMedia, IMovie, IMovieDetails, IMovieProvider } from '../types';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { hostManager } from '../managers';

const BASE_URL = 'https://cinemathek.net';
const http = axios.create({
  baseURL: BASE_URL,
});

export class CinemathekProvider implements IMovieProvider {
  id = '14224df0-7f88-4922-b9ea-e9f0b174eb9c' as UUID;
  name = 'CINEMATHEK';
  type = 'movie' as 'movie';

  async searchMovie(query: string): Promise<IMovie[]> {
    return this.internalMovieSearch(await this.internalSearch(query));
  }
  private async internalSearch(query: string): Promise<Document> {
    const response = await http.get('/', {
      params: new URLSearchParams({ s: query }),
    });
    return new JSDOM(response.data).window.document;
  }

  private internalMovieSearch(document: Document): IMovie[] {
    return Array.from(document.getElementsByClassName('result-item'))
      .filter((item) => item.querySelector('.movies') !== null)
      .map((item) => ({
        id:
          item
            .querySelector('.title > a')
            ?.getAttribute('href')
            ?.replace('https://cinemathek.net', '') || '',
        provider: this.id,
        name: item.querySelector('.title > a')?.textContent || '',
        description: item.querySelector('.contenido')?.textContent || undefined,
        year: parseInt(item.querySelector('.year')?.textContent || '0'),
        imageUrl: item.querySelector('img')?.getAttribute('src') || undefined,
      }));
  }

  async retrieveMovieDetails(movieId: string): Promise<IMovieDetails> {
    const response = await http.get(movieId);
    const { document } = new JSDOM(response.data).window;
    const hosts: IHostMedia[] = [];
    await Promise.all(
      Array.from(document.querySelectorAll('#playeroptionsul > li'))
        .filter((i) => i.getAttribute('data-nume') !== 'trailer')
        .map(async (i) => {
          hosts.push({
            source: (
              await http.get(
                `/wp-json/dooplayer/v2/${i.getAttribute(
                  'data-post',
                )}/movie/${i.getAttribute('data-nume')}`,
              )
            ).data.embed_url as string,
            hostId: hostManager.getHostId(
              i
                .querySelector('.title')
                ?.textContent?.replace('Film starten! ', '') || '',
            ),
          });
        }),
    );
    return {
      id: movieId,
      provider: this.id,
      name: document.querySelector('.sheader > .data > h1')?.textContent || '',
      description:
        document.querySelector('#info > .wp-content > p:first-child')
          ?.textContent || undefined,
      year: new Date(
        document.querySelector('.date')?.textContent || '',
      ).getFullYear(),
      imageUrl:
        document.querySelector('.poster > img')?.getAttribute('src') ||
        undefined,
      sources: [
        {
          language: 'de',
          hosts,
        },
      ],
    };
  }
}
