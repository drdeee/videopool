import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { HostManager } from 'src/lib/managers';

@Injectable()
export class DownloadService {
  private readonly hostManager = new HostManager();

  async getDownloadInformation(source: string, hostId: UUID) {
    const host = this.hostManager.getHost(hostId);
    if (!host) {
      throw new NotFoundException('Host not found');
    }
    return await host.getMedia({ source, hostId });
  }
}
