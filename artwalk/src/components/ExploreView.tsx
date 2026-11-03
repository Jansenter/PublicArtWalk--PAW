import { useEffect, useMemo, useState } from 'react';
import { CITY_ARTWORKS, CATEGORIES, artistCredit, artworkById, categoryOf, stopFor } from '../lib/data';
import { ARTWORK_TAGS, matchesArtworkTags, type ArtworkTag } from '../lib/artwork-tags';
import { distance, formatDistance } from '../lib/geo';
import { useGeolocation } from '../lib/route';
import { NEIGHBOURHOODS, containsArtwork, neighbourhoodColor } from '../lib/neighbourhoods';
import { href, navigate } from '../lib/router';
import { useVisited } from '../lib/storage';
import type { NearbySelection } from '../lib/nearby';
import ArtMap, { categoryColor } from './ArtMap';
import Shell, { BackIcon, IconButton, LocateIcon } from './Shell';
import StoryPanel from './StoryPanel';
import ArtCover from './ArtCover';
import { photosFor } from '../lib/artwork-photos';

export default function ExploreView({ artId }: { artId?: number }) {
  const [areaName, setAreaName] = useState('');
  const [findArea, setFindArea] = useState(false);
  const [areaError, setAreaError] = useState('');
  const area = NEIGHBOURHOODS.find((n) => n.properties.name === areaName);
  const areaWorks = useMemo(() => CITY_ARTWORKS.filter((a) => !area || containsArtwork(area, a)), [area]);
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<ArtworkTag[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [nearby, setNearby] = useState<NearbySelection>({ artworkId: 0, places: [] });
  const [locate, setLocate] = useState(false);
  const { pos: me, error: geoError } = useGeolocation(locate);
  const { isVisited, toggle, visited } = useVisited();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = areaWorks.filter((a) => {
      if (!matchesArtworkTags(a, tags)) return false;
      if (cats.length && !cats.includes(categoryOf(a.type))) return false;
      if (!q) return true;
      return [a.title, a.site, a.address, a.type, a.material, ...a.artists, String(a.year ?? '')]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q));
    });
    return me ? [...list].sort((a, b) => distance(me, a) - distance(me, b)) : [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [query, cats, tags, me, areaWorks]);

  const photoHighlights = filtered.filter((art) => photosFor(art).length > 0).slice(0, 4);

  const open = artId ? artworkById(artId) : undefined;
  const ctx = open ? stopFor(open.id) : undefined;
  const go = (id?: number) => navigate({ view: 'explore', art: id });
  const toggleCat = (k: string) => setCats((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));
  const selectArea = (name: string) => {
    setAreaName(name);
    setFindArea(false);
    setAreaError('');
    go(undefined);
  };
  const visitedHere = areaWorks.filter((a) => visited.includes(a.id)).length;

  useEffect(() => {
    if (!findArea || !me) return;
    const local = NEIGHBOURHOODS.find((n) => containsArtwork(n, me));
    if (local) {
      setAreaName(local.properties.name);
      setQuery('');
      setCats([]);
      setTags([]);
      navigate({ view: 'explore' });
      setAreaError('');
    } else setAreaError('Your location is outside the available neighbourhoods. Choose an area below.');
    setFindArea(false);
  }, [findArea, me]);

  const header = (
    <div className="border-b border-line px-4 pb-3 pt-3">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate({ view: 'home' })} className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-paper-2" aria-label="Back home">
          <BackIcon />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vermilion">Art map</p>
          <h1 className="font-display text-[22px] font-semibold leading-tight">Explore {areaName || 'Vancouver'}</h1>
        </div>
        <a className="rounded-full border border-line px-3 py-2 text-xs font-semibold" href={href({ view: 'profile' })}>My ArtWalk</a>
        <p className="text-right text-xs text-ink-3">
          <span className="font-display text-lg font-semibold text-ink">{visitedHere}</span>/{areaWorks.length}
          <br />
          visited
        </p>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <label className="min-w-0 flex-1 text-xs font-semibold text-ink-3">
          <span className="flex items-center gap-2">
            {area && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: neighbourhoodColor(area.properties.name) }} aria-hidden />}
            Neighbourhood
          </span>
          <select value={areaName} onChange={(e) => selectArea(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink">
            <option value="">All Vancouver</option>
            {NEIGHBOURHOODS.map((n) => <option key={n.properties.name} value={n.properties.name}>{n.properties.name}{n.properties.approximate ? ' (approx.)' : ''}</option>)}
          </select>
        </label>
        <button onClick={() => { setLocate(true); setFindArea(true); setAreaError(''); }} className="h-10 rounded-xl border border-line bg-card px-3 text-sm font-semibold" disabled={findArea && !geoError}>
          {findArea && !geoError ? 'Locating…' : 'My neighbourhood'}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-3">Click a coloured area on the map to explore its artworks.</p>
      {area?.properties.approximate && <p className="mt-1 text-xs text-ink-3">Approximate neighbourhood boundary.</p>}
      {areaError && <p role="status" className="mt-1 text-xs text-ink-3">{areaError}</p>}
      <label className="mt-3 flex items-center gap-2 rounded-full border border-line bg-card px-4 focus-within:border-ink/40">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-ink-3" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, artist, place, material…"
          className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-3"
          aria-label="Search artworks"
        />
      </label>
      <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {ARTWORK_TAGS.map((tag) => {
          const on = tags.includes(tag.key);
          return (
            <button key={tag.key} onClick={() => setTags((current) => on ? current.filter((key) => key !== tag.key) : [...current, tag.key])}
              aria-pressed={on} title="Verified City records only; coverage is incomplete"
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: tag.color }} aria-hidden />
              {tag.label}
            </button>
          );
        })}
        {CATEGORIES.map((c) => {
          const on = cats.includes(c.key);
          const color = categoryColor(c.types[0]);
          return (
            <button
              key={c.key}
              onClick={() => toggleCat(c.key)}
              aria-pressed={on}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
              {c.label}
            </button>
          );
        })}
      </div>
      {tags.length > 0 && <p className="mt-2 text-xs text-ink-3">Verified City records only; coverage is incomplete. BIPOC includes Indigenous artists. Selected tags also apply to the chosen artwork types.</p>}
    </div>
  );

  const panel = (
    <div>
      {photoHighlights.length > 0 && (
        <section className="border-b border-line p-4" aria-labelledby="explore-photo-title">
          <h2 id="explore-photo-title" className="mb-3 text-sm font-semibold">A few to discover</h2>
          <div className="grid grid-cols-2 gap-3">
            {photoHighlights.map((art) => (
              <button key={art.id} onClick={() => go(art.id)} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card text-left transition hover:bg-paper-2">
                <ArtCover art={art} compact className="h-28 w-full" />
                <span className="block px-3 py-2 text-sm font-semibold leading-snug">{art.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    <ul className="divide-y divide-line px-2 pb-10">
      <li className="px-2 py-2 text-xs text-ink-3">
        {filtered.length} {filtered.length === 1 ? 'artwork' : 'artworks'}{me ? ' · nearest first' : ''}
      </li>
      {filtered.map((a) => {
        const credit = artistCredit(a, stopFor(a.id)?.stop);
        return (
          <li key={a.id}>
            <button onClick={() => go(a.id)} className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-paper-2">
              {photosFor(a).length > 0 ? <ArtCover art={a} compact className="h-16 w-16 shrink-0 rounded-xl" /> : <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: categoryColor(a.type) }} aria-hidden />}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">{a.title}</span>
                <span className="block truncate text-sm text-ink-3">
                  {a.year ?? '—'} · {credit.source === 'unknown' ? a.type : credit.name}
                </span>
              </span>
              <span className="shrink-0 text-xs text-ink-3">
                {isVisited(a.id) ? <span className="font-semibold text-good">✓</span> : me ? formatDistance(distance(me, a)) : ''}
              </span>
            </button>
          </li>
        );
      })}
      {!filtered.length && <li className="px-2 py-10 text-center text-ink-3">No artworks match. Try another word or clear the filters.</li>}
    </ul>
    </div>
  );

  const map = (
    <>
      <ArtMap
        nearby={nearby.artworkId === artId ? nearby : undefined}
        onNearbySelect={(id) => setNearby((current) => ({ ...current, selectedId: id }))}
        mode="explore"
        boundary={area}
        areas={NEIGHBOURHOODS}
        onAreaSelect={selectArea}
        fitKey={`explore-${areaName}-${cats.join(',')}-${tags.join(',')}-${query}`}
        points={filtered.map((art) => ({ art, visited: isVisited(art.id) }))}
        activeId={open?.id}
        focusId={open?.id}
        onSelect={(id) => go(id)}
        me={me}
      />
      <div className="absolute right-3 top-16 z-[500]">
        <IconButton label={locate ? 'Stop showing my location' : 'Show my location'} onClick={() => { setLocate((v) => !v); setFindArea(false); }}>
          <LocateIcon on={locate && !!me} />
        </IconButton>
      </div>
      {geoError && locate && <p className="absolute left-3 top-3 z-[500] max-w-[70%] rounded-xl bg-card px-3 py-2 text-xs shadow">{geoError}</p>}
    </>
  );

  const story = open && (
    <StoryPanel
      nearby={nearby.artworkId === artId ? nearby : undefined}
      onNearbyChange={setNearby}
      key={open.id}
      art={open}
      stop={ctx?.stop}
      partOf={ctx?.tour}
      visited={isVisited(open.id)}
      me={me}
      onToggleVisited={() => toggle(open.id)}
      onClose={() => go(undefined)}
      onGo={(id) => go(id)}
    />
  );

  return <Shell header={header} panel={panel} map={map} story={story || undefined} />;
}
