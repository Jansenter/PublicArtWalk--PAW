import raw from '../data/artworks.json';
import artistProfiles from '../data/artists.json';
import cityRaw from '../data/city-artworks.json';
import { TOURS, type Tour, type TourStop } from '../data/tours';

export interface Artwork {
  photos?: import('./artwork-photos').ArtworkPhoto[];
  id: number;
  title: string;
  type: string;
  year: number | null;
  material: string | null;
  site: string | null;
  address: string | null;
  locationOnSite: string | null;
  lat: number;
  lon: number;
  description: string | null;
  statement: string | null;
  artistIds: string[];
  artists: string[];
  ownership: string | null;
  photoCredit: string | null;
  url: string;
}

const artistById = new Map(artistProfiles.map((artist) => [artist.id, artist]));
export function artistsFor(art: Artwork) {
  return art.artistIds.flatMap((id) => {
    const artist = artistById.get(id);
    return artist ? [artist] : [];
  });
}
function enrichArtwork(art: Artwork): Artwork {
  return {
    ...art,
    artists: art.artists.length ? art.artists : artistsFor(art).map((artist) => artist.name).filter(Boolean),
  };
}
export const ARTWORKS = (raw as Artwork[]).map(enrichArtwork);
// Existing curated records take priority; never regenerate or replace them for Explore.
export const CITY_ARTWORKS = [...new Map([
  ...(cityRaw as Artwork[]).map(enrichArtwork).map((a) => [a.id, a] as const),
  ...ARTWORKS.map((a) => [a.id, a] as const),
]).values()];
const byId = new Map(CITY_ARTWORKS.map((a) => [a.id, a]));

export const artworkById = (id: number) => byId.get(id);

const verifiedArtistNames = new Map(artistProfiles.map((entry) => [entry.id, entry.name]));

/** Artist credit for display, with where it came from. */
export function artistCredit(art: Artwork, stop?: TourStop): { name: string; source: 'registry' | 'curator' | 'unknown' } {
  if (art.artists.length) return { name: art.artists.join(' & '), source: 'registry' };
  const verifiedNames = art.artistIds.map((id) => verifiedArtistNames.get(id));
  if (verifiedNames.length && verifiedNames.every((name) => !!name)) return { name: verifiedNames.join(' & '), source: 'registry' };
  if (stop?.curatedArtist) return { name: stop.curatedArtist, source: 'curator' };
  const ids = art.artistIds.length ? ` (registry artist #${art.artistIds.join(', #')})` : '';
  return { name: `Artist not named in open data${ids}`, source: 'unknown' };
}

export function tourStops(tour: Tour): { stop: TourStop; art: Artwork }[] {
  return tour.stops
    .map((stop) => ({ stop, art: byId.get(stop.id)! }))
    .filter((s) => s.art);
}

/** Find the tour (if any) an artwork belongs to, preferring the one in context. */
export function stopFor(artId: number, tourId?: string): { tour: Tour; stop: TourStop; index: number } | undefined {
  const order = [...TOURS.filter((t) => t.id === tourId), ...TOURS.filter((t) => t.id !== tourId)];
  for (const tour of order) {
    const index = tour.stops.findIndex((s) => s.id === artId);
    if (index >= 0) return { tour, stop: tour.stops[index], index };
  }
  return undefined;
}

/** Group the registry's many types into a few friendly filter categories. */
export const CATEGORIES: { key: string; label: string; types: string[] }[] = [
  { key: 'sculpture', label: 'Sculpture', types: ['Sculpture', 'Figurative'] },
  { key: 'site', label: 'Built into the city', types: ['Site-integrated work', 'Gateway'] },
  { key: 'memorial', label: 'Memorials', types: ['Memorial or monument'] },
  { key: 'water', label: 'Fountains', types: ['Fountain or water feature'] },
  { key: 'wall', label: 'Murals & mosaics', types: ['Mural', 'Mosaic', 'Relief', 'Two-dimensional artwork'] },
  { key: 'indigenous', label: 'Totem poles', types: ['Totem pole'] },
  { key: 'media', label: 'Media', types: ['Media work'] },
];

export const categoryOf = (type: string) => CATEGORIES.find((c) => c.types.includes(type))?.key ?? 'sculpture';
