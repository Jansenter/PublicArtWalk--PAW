import { useMemo, useState } from 'react';
import type { Tour, TourStop } from '../data/tours';
import { ARTWORK_TAGS, artworkTagEvidence } from '../lib/artwork-tags';
import { artistsFor, artistCredit, type Artwork } from '../lib/data';
import { distance, formatDistance, osmDirections, walkMinutes, type LatLon } from '../lib/geo';
import { speechSupported, toChunks, useNarration } from '../lib/speech';
import ArtworkGallery from './ArtworkGallery';
import ArtworkSocial from './ArtworkSocial';
import ArtworkComments from './ArtworkComments';
import NearbyPlaces from './NearbyPlaces';
import type { NearbySelection } from '../lib/nearby';
import Challenge from './Challenge';
import { useCollection, useProfile } from '../lib/profile';
import { href } from '../lib/router';

interface Props {
  nearby?: NearbySelection;
  onNearbyChange: (selection: NearbySelection) => void;
  art: Artwork;
  tour?: Tour;
  stop?: TourStop;
  index?: number; // 0-based stop index
  total?: number;
  prev?: Artwork;
  next?: Artwork;
  visited: boolean;
  me: LatLon | null;
  onToggleVisited: () => void;
  onClose: () => void;
  onGo: (id: number) => void;
  /** In Explore: the tour this artwork belongs to, if any. */
  partOf?: Tour;
}

const RATES = [0.85, 1, 1.2];

export default function StoryPanel({ art, tour, stop, index, total, prev, next, visited, me, onToggleVisited, onClose, onGo, partOf, nearby: nearbyPlaces, onNearbyChange }: Props) {
  const [profile] = useProfile();
  const collection = useCollection();
  const accent = tour?.accent ?? '#e2512f';
  const credit = artistCredit(art, stop);
  const artists = artistsFor(art);

  // Narration = intro + verified description + project statement, chunked per sentence.
  const sections = useMemo(() => {
    const intro = [
      `${art.title}.`,
      credit.source !== 'unknown' ? `By ${credit.name}.` : '',
      art.year ? `Installed in ${art.year}${art.site ? `, at ${art.site}` : ''}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const list: { label: string; chunks: string[] }[] = [{ label: '', chunks: toChunks(intro) }];
    if (art.description) list.push({ label: 'About the work', chunks: toChunks(art.description) });
    if (art.statement && art.statement !== art.description)
      list.push({ label: 'From the project statement', chunks: toChunks(art.statement) });
    return list;
  }, [art, credit.name, credit.source]);

  const allChunks = useMemo(() => sections.flatMap((s) => s.chunks), [sections]);
  const narration = useNarration(allChunks);
  const [showAll, setShowAll] = useState(false);
  const longText = allChunks.join(' ').length > 900;

  const from = me ?? (prev ? { lat: prev.lat, lon: prev.lon } : null);
  const dist = me ? distance(me, art) : null;
  const nearby = dist !== null && dist < 60;

  let offset = 0;

  return (
    <article className="relative flex h-full flex-col bg-paper" aria-label={`Story: ${art.title}`}>
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-2" aria-label="Close story">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          {tour && index !== undefined ? (
            <>
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
                {tour.title}
              </p>
              <p className="text-sm font-semibold">
                Stop {index + 1} <span className="font-normal text-ink-3">of {total}</span>
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Explore Downtown</p>
          )}
        </div>
        {tour && (
          <div className="flex gap-1">
            <button
              disabled={!prev}
              onClick={() => prev && onGo(prev.id)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-30"
              aria-label="Previous stop"
            >
              ←
            </button>
            <button
              disabled={!next}
              onClick={() => next && onGo(next.id)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-30"
              aria-label="Next stop"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="relative">
          <ArtworkGallery key={art.id} art={art} />
          <a
            href={art.url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-white"
          >
            See photos on City registry ↗
          </a>
        </div>

        <div className="space-y-5 px-5 pb-32 pt-5">
          <header className="rise">
            <h2 className="font-display text-[28px] font-semibold leading-[1.1] tracking-tight">{art.title}</h2>
            <p className="mt-2 text-[15px] text-ink-2">
              {credit.source === 'unknown' ? <span className="text-ink-3">{credit.name}</span> : credit.name}
              {credit.source === 'curator' && (
                <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-semibold text-ink-3" title="Artist credit added by the ArtWalk curators; not in the open-data export">
                  curator credit
                </span>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium">
              {art.year && <span className="rounded-full bg-ink px-2.5 py-1 text-paper">{art.year}</span>}
              <span className="rounded-full border border-line px-2.5 py-1">{art.type}</span>
              {visited && <span className="rounded-full bg-good/10 px-2.5 py-1 text-good">✓ Visited</span>}
            </div>
          </header>

          <div className="my-3 flex flex-wrap items-center gap-3">
            {profile.name ? <button onClick={() => collection.toggle(art.id)} aria-pressed={collection.ids.includes(art.id)} className="min-h-11 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold">{collection.ids.includes(art.id) ? '♥ Saved to collection' : '♡ Save to collection'}</button> : <a href={href({ view: 'profile' })} className="min-h-11 rounded-full border border-line px-4 py-2 text-sm font-semibold">Create a profile to save this piece →</a>}
            {profile.name && <a className="text-sm font-semibold underline" href={href({ view: 'profile' })}>My collection & walks →</a>}
          </div>
          <ArtworkSocial key={art.id} art={art} visited={visited} />

          {partOf && (
            <a
              href={`#/tour/${partOf.id}?art=${art.id}`}
              className="flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold"
              style={{ background: partOf.accentSoft, color: partOf.accent }}
            >
              <span aria-hidden>✦</span>
              <span className="flex-1">A stop on the “{partOf.title}” walk</span>
              <span aria-hidden>→</span>
            </a>
          )}

          {/* Where */}
          <section className="rounded-2xl bg-paper-2/70 p-4 text-sm">
            <p className="font-semibold">{art.site ?? art.address ?? 'Downtown Vancouver'}</p>
            {art.address && art.site && <p className="text-ink-2">{art.address}</p>}
            {art.locationOnSite && <p className="mt-1 text-ink-3">Look for it: {art.locationOnSite}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {from && (
                <a href={osmDirections(from, art)} target="_blank" rel="noreferrer" className="font-semibold underline decoration-2 underline-offset-4" style={{ textDecorationColor: accent }}>
                  Walking directions ↗
                </a>
              )}
              {dist !== null && (
                <span className="text-ink-2">
                  {nearby ? 'You’re here!' : `${formatDistance(dist)} away · ~${walkMinutes(dist * 1.3)} min`}
                </span>
              )}
            </div>
          </section>

          <NearbyPlaces key={`nearby-${art.id}`} art={art} nearby={nearbyPlaces} onNearbyChange={onNearbyChange} />

          {/* Listen */}
          <section aria-labelledby={`listen-${art.id}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={narration.toggle}
                disabled={!speechSupported}
                className="flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40"
                style={{ background: accent }}
                aria-label={narration.state === 'playing' ? 'Pause narration' : 'Listen to the story'}
              >
                {narration.state === 'playing' ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M4 2.5v11a.5.5 0 00.77.42l8.5-5.5a.5.5 0 000-.84l-8.5-5.5A.5.5 0 004 2.5z" /></svg>
                )}
                <span id={`listen-${art.id}`}>{narration.state === 'playing' ? 'Pause' : narration.state === 'paused' ? 'Resume' : 'Listen'}</span>
              </button>
              {narration.state !== 'idle' && (
                <button onClick={narration.stop} className="h-10 rounded-full px-3 text-sm font-semibold text-ink-2 hover:bg-paper-2">
                  Stop
                </button>
              )}
              <div className="ml-auto flex rounded-full border border-line p-0.5 text-xs font-semibold" role="group" aria-label="Narration speed">
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => narration.setRate(r)}
                    aria-pressed={narration.rate === r}
                    className={`rounded-full px-2.5 py-1.5 ${narration.rate === r ? 'bg-ink text-paper' : 'text-ink-2'}`}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            </div>
            {!speechSupported && <p className="mt-2 text-sm text-ink-3">Audio isn’t supported in this browser — the transcript below has the full story.</p>}

            {/* Transcript — every sentence is clickable to start narration from there */}
            <div className={`relative mt-4 ${!showAll && longText ? 'max-h-80 overflow-hidden' : ''}`}>
              {sections.map((sec, si) => {
                const start = offset;
                offset += sec.chunks.length;
                if (si === 0) return null; // intro is already the header
                return (
                  <div key={si} className="mb-4">
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">{sec.label}</h3>
                    <p className="text-[16px] leading-[1.7] text-ink">
                      {sec.chunks.map((c, ci) => {
                        const gi = start + ci;
                        const on = narration.index === gi && narration.state !== 'idle';
                        return (
                          <span
                            key={ci}
                            onClick={() => speechSupported && narration.jumpTo(gi)}
                            className={`cursor-pointer rounded px-0.5 transition-colors ${on ? 'text-ink' : 'hover:bg-paper-2'}`}
                            style={on ? { background: tour?.accentSoft ?? '#fbe0d6' } : undefined}
                          >
                            {c}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
              {sections.length === 1 && (
                <p className="text-[15px] text-ink-3">The registry doesn’t include a written description for this work yet. Visit it and tell its story your own way.</p>
              )}
              {!showAll && longText && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent" />}
            </div>
            {longText && (
              <button onClick={() => setShowAll((v) => !v)} className="mt-1 text-sm font-semibold underline underline-offset-4">
                {showAll ? 'Show less' : 'Read full transcript'}
              </button>
            )}
          </section>

          {artists.length > 0 && (
            <section aria-labelledby={`artists-${art.id}`} className="rounded-2xl border border-line p-4 text-sm">
              <h3 id={`artists-${art.id}`} className="font-semibold">{artists.length === 1 ? 'About the artist' : 'About the artists'}</h3>
              {artists.map((artist) => <details key={artist.id} className="mt-3">
                <summary className="cursor-pointer font-semibold">{artist.name}</summary>
                {artist.biography ? <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-2">{artist.biography}</p> : <p className="mt-2 text-xs text-ink-3">The City registry has no biography for this artist yet.</p>}
                {artist.country && <p className="mt-2 text-xs text-ink-3">Country listed in registry: {artist.country}</p>}
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  {artist.source && <a href={artist.source} target="_blank" rel="noopener noreferrer" className="underline">City artist profile ↗</a>}
                  {artist.website && <a href={artist.website} target="_blank" rel="noopener noreferrer" className="underline">Artist website ↗</a>}
                </div>
              </details>)}
            </section>
          )}

          <ArtworkComments key={`comments-${art.id}`} art={art} />
          <Challenge key={art.id} art={art} prompt={stop?.prompt} accent={accent} />

          {ARTWORK_TAGS.some((tag) => artworkTagEvidence(art, tag.key).length > 0) && (
            <details className="rounded-2xl border border-line p-4 text-sm">
              <summary className="cursor-pointer font-semibold">Artwork tags &amp; sources</summary>
              {ARTWORK_TAGS.map((tag) => {
                const sources = artworkTagEvidence(art, tag.key);
                return sources.length > 0 && <div key={tag.key} className="mt-3">
                  <h3 className="font-semibold">{tag.label}</h3>
                  {sources.map((source, i) => <p key={`${source.source}-${i}`} className="mt-1 text-xs text-ink-3">
                    {source.evidence}{' '}<a href={source.source} target="_blank" rel="noopener noreferrer" className="underline">City source ↗</a>
                  </p>)}
                </div>;
              })}
            </details>
          )}

          {/* Facts + sources */}
          <section className="text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {art.material && (
                <>
                  <dt className="text-ink-3">Material</dt>
                  <dd>{art.material}</dd>
                </>
              )}
              {art.ownership && (
                <>
                  <dt className="text-ink-3">Owner</dt>
                  <dd>{art.ownership}</dd>
                </>
              )}
              <dt className="text-ink-3">Registry ID</dt>
              <dd>#{art.id}</dd>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-3">
              Source:{' '}
              <a href={art.url} target="_blank" rel="noreferrer" className="underline">
                City of Vancouver Public Art Registry
              </a>
              {art.id === 24 ? (
                <>
                  {' '}· Photo: <a href="https://www.heritagesitefinder.ca/location/angel-of-victory-cpr-station-bronze-war-memorial/" target="_blank" rel="noreferrer" className="underline">Chimp Photo Club</a>
                </>
              ) : art.photoCredit ? <> · Registry photo credit: {art.photoCredit}</> : null}. Contains information licensed under the Open Government Licence – Vancouver.
            </p>
          </section>
        </div>
      </div>

      {/* Primary action */}
      <div className="absolute inset-x-0 bottom-0 border-t border-line bg-paper/95 p-3 backdrop-blur">
        <div className="flex gap-2">
          <button
            onClick={onToggleVisited}
            className={`h-12 flex-1 rounded-full font-semibold transition active:scale-[0.99] ${
              visited ? 'border border-good/40 bg-good/10 text-good' : nearby ? 'bg-good text-white' : 'bg-ink text-paper'
            }`}
          >
            {visited ? '✓ Visited — tap to undo' : nearby ? 'You’re here — mark visited' : 'Mark as visited'}
          </button>
          {tour && next && visited && (
            <button onClick={() => onGo(next.id)} className="pop h-12 rounded-full px-5 font-semibold text-white" style={{ background: accent }}>
              Next stop →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
