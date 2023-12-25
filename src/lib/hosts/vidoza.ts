import { UUID } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';
import http from 'axios';
import { JSDOM } from 'jsdom';

export class VidozaHost implements IHost {
  id = '519eabb6-f75f-4499-a7fc-19d30deb62b2' as UUID;
  name = 'Vidoza';
  mediaType = 'mp4' as MediaType;

  isSupported = true;
  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    const response = await http.get(hostMedia.source);
    const { document } = new JSDOM(response.data).window;
    return {
      source:
        document.querySelector('video > source')?.getAttribute('src') || '',
      type: 'mp4',
    };
  }
}
