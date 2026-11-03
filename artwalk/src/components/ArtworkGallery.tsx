import { useState } from 'react';
import type { Artwork } from '../lib/data';
import { photosFor, type ArtworkPhoto } from '../lib/artwork-photos';
import ArtCover from './ArtCover';

function Photo({ photo, art }: { photo: ArtworkPhoto; art: Artwork }) {
  const [failed, setFailed] = useState(false);
  return <figure className="w-full shrink-0 snap-center">
    {failed ? <ArtCover art={{ ...art, id: -1, photos: [] }} className="h-52" /> : (
      <img src={photo.src} alt={photo.alt} onError={() => setFailed(true)} className="mx-auto block h-auto max-h-[55svh] w-full object-contain" loading="lazy" />
    )}
    {(photo.credit || photo.license || failed) && <figcaption className="px-4 py-2 text-xs text-ink-2">
      {failed ? 'Photo unavailable.' : [photo.credit, photo.license].filter(Boolean).join(' · ')}
      {!failed && photo.sourceUrl && <> · <a href={photo.sourceUrl} target="_blank" rel="noreferrer" className="underline">Photo source ↗</a></>}
    </figcaption>}
  </figure>;
}

export default function ArtworkGallery({ art }: { art: Artwork }) {
  const photos = photosFor(art);
  if (!photos.length) return <ArtCover art={art} className="h-44 sm:h-52" />;
  return <div>
    <div tabIndex={photos.length > 1 ? 0 : undefined} role="region" aria-label={`Photos of ${art.title}`} className="flex snap-x snap-mandatory items-start overflow-x-auto bg-paper-2">
      {photos.map((photo) => <Photo key={`${art.id}:${photo.src}`} photo={photo} art={art} />)}
    </div>
    {photos.length > 1 && <p className="px-4 py-2 text-xs text-ink-2">{photos.length} photos · Swipe, scroll, or use arrow keys to see more.</p>}
  </div>;
}
