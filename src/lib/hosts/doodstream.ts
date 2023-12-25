import { UUID, randomBytes } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';
import axios from 'axios';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/66.0',
};

const http = axios.create({
  headers: HEADERS,
});

export class DoodStreamHost implements IHost {
  id = 'ae493ecf-3f0d-4b86-ad01-0e1176adaf09' as UUID;
  name = 'DoodStream';
  isSupported = true;
  mediaType = 'mp4' as MediaType;

  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    const page = await http.get(hostMedia.source);
    const doodUrl = page.request.res.responseUrl;
    const authUrl = (page.data as string).match(
      new RegExp("/pass_md5/.*?'"),
    )![0];

    const token = (page.data as string)
      .match(new RegExp("[?&]token=([a-z0-9]+)[&']"))![0]
      .replace('&token=', '')
      .replace('&', '');

    const authPage = await http.get(authUrl.slice(0, -1), {
      baseURL: new URL(doodUrl).origin,
      headers: {
        referer: doodUrl,
      },
    });

    return {
      source: `${authPage.data}${randomBytes(5).toString(
        'hex',
      )}?token=${token}&expiry=${new Date().getTime()}`,
      type: 'mp4',
      headers: {
        ...HEADERS,
        referer: doodUrl,
      },
    };
  }
}
