import { UUID } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';

export class FileLionsHost implements IHost {
  id = 'fe81c7cc-2d52-40f1-a19c-93932dc79afb' as UUID;
  name = 'FileLions';
  isSupported = false;

  mediaType = 'mp4' as MediaType;

  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    throw new Error('Host not supported');
  }
}
