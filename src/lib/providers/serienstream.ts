import { UUID } from 'crypto';
import axios from 'axios';
import { JSDOM } from 'jsdom';

import {
  IEpisode,
  ISeason,
  ISerie,
  ISerieDetails,
  ISerieProvider,
  ISerieRetrievalOptions,
} from '../types';
import { toLanguageShort } from '../utils';
import { hostManager } from '../managers';

const BASE_URL = 'https://s.to/';
const http = axios.create({
  baseURL: BASE_URL,
});

export class SerienstreamProvider implements ISerieProvider {
  id = '350c564f-0eaa-4dca-9420-dac51b83e652' as UUID;
  name = 'serienstream';
  type = 'serie' as const;
  async searchSerie(query: string): Promise<ISerie[]> {
    const response = await http.post<
      { title: string; description: string; link: string }[]
    >('/ajax/search', new URLSearchParams({ keyword: query }));
    return response.data
      .filter((s) => {
        let count = 0;
        for (
          let i = (count = 0);
          i < s.link.length;
          count += +('/' === s.link[i++])
        );
        return count == 3 && s.link.startsWith('/serie/stream/');
      })
      .map((s) => ({
        id: s.link,
        provider: this.id,
        name: JSDOM.fragment(s.title).textContent || '',
        description: JSDOM.fragment(s.description).textContent || '',
      }));
  }

  async retrieveSerieDetails(
    serieId: string,
    options: ISerieRetrievalOptions = { loadSeasonsComplete: false },
  ): Promise<ISerieDetails> {
    const response = await http.get(serieId);
    const { document } = new JSDOM(response.data).window;
    const seasons: ISeason[] = [];
    await Promise.all(
      Array.from(document.querySelectorAll('#stream > ul:first-child a')).map(
        async (a, index) => {
          seasons.push(
            options.loadSeasonsComplete
              ? await this.retrieveSeason(a.getAttribute('href')!)
              : {
                  id: a.getAttribute('href')!,
                  provider: this.id,
                  number: index + 1,
                  episodesLoaded: options.loadSeasonsComplete || false,
                },
          );
        },
      ),
    );

    return {
      id: serieId,
      provider: this.id,
      name:
        document.querySelector('.series-title > h1 > span')?.textContent || '',
      description:
        document
          .querySelector('.seri_des')
          ?.getAttribute('data-full-description') || '',
      imageUrl:
        document
          .querySelector('.seriesCoverBox > img')
          ?.getAttribute('data-src') || '',
      seasons,
    };
  }

  async retrieveSeason(seasonId: string): Promise<ISeason> {
    const response = await http.get(seasonId);
    const { document } = new JSDOM(response.data).window;
    const seasonNumber = parseInt(
      document.querySelector('#stream > ul:first-child a.active')
        ?.textContent || '1',
    );
    return {
      id: seasonId,
      provider: this.id,
      number: seasonNumber,
      episodesLoaded: true,
      episodes: Array.from(
        document.querySelectorAll(`#season${seasonNumber} > tr`),
      ).map((row) => {
        return {
          id:
            row
              .querySelector('td.season2EpisodeID > a')
              ?.getAttribute('href') || '',
          provider: this.id,
          name:
            row.querySelector('td.seasonEpisodeTitle > a > strong')
              ?.textContent || '',
          languages: Array.from(row.querySelectorAll('img.flag'))
            .map((img) => img.getAttribute('src') || '')
            .map((l) => toLanguageShort(l)),
          hosts: Array.from(row.querySelectorAll('td > a > i.icon'))
            .map((icon) => icon.getAttribute('title') || '')
            .map((host) => hostManager.getHostId(host)),
        };
      }),
    };
  }

  async retrieveEpisode(episodeId: string): Promise<IEpisode> {
    const response = await http.get(episodeId);
    const { document } = new JSDOM(response.data).window;
    const languages = Array.from(
      document.querySelectorAll('.changeLanguageBox > img'),
    ).map((img) => ({
      language: toLanguageShort(img.getAttribute('src') || ''),
      key: img.getAttribute('data-lang-key') || '',
    }));
    const hosts = Array.from(
      document.querySelectorAll('.hosterSiteVideo > ul.row > li'),
    ).map((item) => ({
      providerId: this.id,
      key: item.getAttribute('data-lang-key'),
      hostId: hostManager.getHostId(
        item
          .querySelector('i')
          ?.getAttribute('title')
          ?.replace('Hoster ', '') || '',
      ),
      source: item.querySelector('a.watchEpisode')?.getAttribute('href') || '',
    }));
    return {
      id: episodeId,
      provider: this.id,
      sources: languages.map((language) => ({
        language: language.language,
        hosts: hosts
          .filter((host) => host.key === language.key)
          .map((host) => ({
            hostId: host.hostId,
            source: new URL(host.source, BASE_URL).href,
          })),
      })),
    };
  }
}
