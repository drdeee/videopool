import { UUID } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';
import { JSDOM } from 'jsdom';
import http from 'axios';
import { getDefinedProperty } from '../utils';
export class StreamWishHost implements IHost {
  id = '686d5a10-a2e2-425c-8b47-846d167c97f4' as UUID;
  name = 'StreamWish';
  mediaType = 'hls' as MediaType;

  isSupported = true;
  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    const response = await http.get(hostMedia.source);
    const document = new JSDOM(response.data).window.document;
    const sources = getDefinedProperty<{ file: string }[]>(
      Array.from(document.getElementsByTagName('script'))
        .map((i) => i.innerHTML)
        .join('\n'),
      'sources',
    );
    return { source: sources![0].file, type: 'hls' };
  }
}
