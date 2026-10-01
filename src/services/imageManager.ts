import { Image } from 'react-native';
import { DogApiImage } from '../types';

export type ImageTier = 'thumbnail' | 'detail' | 'fullscreen';

export interface ImageCacheConfig {
  maxDiskCacheBytes: number;
  maxMemoryItems: number;
}

export const DEFAULT_IMAGE_CONFIG: ImageCacheConfig = {
  maxDiskCacheBytes: 50 * 1024 * 1024,
  maxMemoryItems: 60,
};

export class ImageManager {
  private static prefetchQueue = new Set<string>();

  static resolveVariantUrl(
    image: DogApiImage | undefined,
    tier: ImageTier = 'thumbnail'
  ): string {
    if (!image) return '';

    switch (tier) {
      case 'thumbnail':
        return image.thumb || image.medium || image.url;
      case 'detail':
        return image.medium || image.large || image.url;
      case 'fullscreen':
        return image.large || image.medium || image.url;
      default:
        return image.thumb || image.url;
    }
  }

  static prefetchBatch(urls: string[]): void {
    for (const url of urls) {
      if (!url || this.prefetchQueue.has(url)) continue;
      this.prefetchQueue.add(url);
      Image.prefetch(url).catch(() => {
        this.prefetchQueue.delete(url);
      });
    }

    if (this.prefetchQueue.size > 200) {
      this.prefetchQueue.clear();
    }
  }
}
