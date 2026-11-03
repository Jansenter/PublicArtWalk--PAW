import type { Artwork } from './data';

export const ARTWORK_PHOTOS: Record<number, string> = {
  24: 'images/angel-of-victory-cordova-chimp-photo-club.jpg',
  44: 'images/lions.jpg',
  45: 'images/ed.jpg',
  392: 'images/slidingedge.webp',
  404: 'images/lightshed.jpeg',
  438: 'images/drop.webp',
  521: 'images/Digital_Orca_Vancouver.jpg',
  555: 'images/nike.JPG',
  559: 'images/gurunanak.jpg',
  755: 'images/caption.jpg',
  865: 'images/weekendchime.jpeg',
};


export type ArtworkPhoto = { src: string; alt: string; credit?: string; sourceUrl?: string; license?: string };

export function photosFor(art: Artwork): ArtworkPhoto[] {
  if (art.photos?.length) return art.photos;
  const path = ARTWORK_PHOTOS[art.id];
  return path ? [{ src: `${import.meta.env.BASE_URL}${path}`, alt: art.title }] : [];
}
