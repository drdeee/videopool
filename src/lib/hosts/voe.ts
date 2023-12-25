import { UUID } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';
import { JSDOM } from 'jsdom';
import http from 'axios';
import { getDefinedVariable } from '../utils';

export class VOEHost implements IHost {
  id = 'bfe912e8-6711-4c05-845a-4d3ea5b33523' as UUID;
  name = 'VOE';
  mediaType = 'hls' as MediaType;

  isSupported = true;
  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    const response = await http.get(hostMedia.source);
    const document = new JSDOM(response.data).window.document;
    const source = getDefinedVariable<{ hls: string }>(
      Array.from(document.getElementsByTagName('script'))
        .map((s) => s.innerHTML)
        .join('\n'),
      'sources',
    );

    return {
      source: source?.hls || '',
      type: 'hls',
    };
  }
}
