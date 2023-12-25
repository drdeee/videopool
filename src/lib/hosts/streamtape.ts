import { UUID } from 'crypto';
import { IHost, IHostMedia, IMedia, MediaType } from '../types';
import http from 'axios';

function fixTitle(str = '') {
  let all = str.split('.');
  return all[0];
}

const urlRegex = /document\.getElementById\('robotlink'\)\.innerHTML = (.*);/;
const tokenRegex = /token=([^&']+)/;

export class StreamtapeHost implements IHost {
  id = 'a40d2a57-8d12-4bf6-ab79-97cf6e822d85' as UUID;
  name = 'Streamtape';
  mediaType = 'mp4' as MediaType;

  isSupported = true;
  async getMedia(hostMedia: IHostMedia): Promise<IMedia> {
    const response = await http.get(hostMedia.source);
    const html = response.data;
    const parsedUrl = new URL(response.request.res.responseUrl);

    const urlMatch = html.match(urlRegex);
    const tokenMatch = urlMatch[1].match(tokenRegex);

    const fullUrlRegex =
      /<div id="ideoolink" style="display:none;">(.*)<[/]div>/;
    const fullUrlMatch = html.match(fullUrlRegex);

    let finalUrl = fullUrlMatch[1].split(parsedUrl.hostname)[1];
    finalUrl = `https://${parsedUrl.hostname}${finalUrl}&token=${tokenMatch[1]}`;

    return {
      type: 'mp4',
      source: finalUrl + '&dl=1',
    };
  }
}
