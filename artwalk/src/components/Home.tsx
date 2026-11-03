import { useEffect, useMemo, useRef, useState } from 'react';
import { TOURS } from '../data/tours';
import { ARTWORKS, artistCredit, tourStops, type Artwork } from '../lib/data';
import { formatDistance, walkingEstimate } from '../lib/geo';
import { href, navigate } from '../lib/router';
import { useVisited } from '../lib/storage';
import ArtCover from './ArtCover';
import ArtMap from './ArtMap';
import CommunityHub from './CommunityHub';
import { useLanguage } from '../lib/language';
import { LanguageButton, ProfileButton } from './Shell';
import { speechSupported, toChunks, useNarration } from '../lib/speech';
import { useTranslatedTexts } from '../lib/language';
import Challenge from './Challenge';

function ListenFeaturePreview({ art }: { art: Artwork }) {
  const { t, language } = useLanguage();
  const translated = useTranslatedTexts([art.description ?? '']);
  const description = translated.values[0] ?? art.description ?? '';
  const credit = artistCredit(art);
  const chunks = useMemo(() => toChunks([art.title, credit.name, description].filter(Boolean).join('. ')), [art.title, credit.name, description]);
  const narration = useNarration(chunks);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm" aria-label={language === 'zh' ? '聆听功能预览' : language === 'fr' ? 'Aperçu de la fonction audio' : 'Listen feature preview'}>
      <div className="border-b border-line bg-paper-2/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-3">
        {language === 'zh' ? '海滨奇观 · 第 1 站' : language === 'fr' ? 'Merveilles du front de mer · Arrêt 1' : 'Waterfront Wonders · Stop 1'}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-ink-3">{credit.name}</p>
        <h3 className="mt-0.5 font-display text-xl font-semibold">{art.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{description || (language === 'zh' ? '在这里收听作品介绍。' : language === 'fr' ? 'Écoutez la présentation de cette œuvre ici.' : 'Listen to the artwork story here.')}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={narration.toggle}
            disabled={!speechSupported}
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: TOURS[0].accent }}
            aria-label={narration.state === 'playing' ? t('Pause narration') : t('Listen to the story')}
          >
            <span aria-hidden>{narration.state === 'playing' ? 'Ⅱ' : '▶'}</span>
            {narration.state === 'playing' ? t('Pause') : narration.state === 'paused' ? t('Resume') : t('Listen')}
          </button>
          <span className="text-xs text-ink-3">{language === 'zh' ? '故事朗读预览' : language === 'fr' ? 'Aperçu de la narration' : 'Narrated story preview'}</span>
        </div>
        {translated.loading && <p className="mt-2 text-xs text-ink-3" role="status">{language === 'zh' ? '正在翻译说明…' : 'Traduction de la description…'}</p>}
      </div>
    </div>
  );
}

const HERO_IMAGES = [
  { src: '/images/vancouver-lighthouse.webp', alt: 'Lighthouse on the rocky Vancouver coast' },
  { src: '/images/gastown.webp', alt: 'Tree-lined street in historic Gastown' },
  { src: '/images/vancouver-waterfront.webp', alt: 'Vancouver waterfront at sunset' },
  { src: '/images/capilano-bridge.jpg', alt: 'Suspension bridge through a Vancouver forest' },
];

export default function Home() {
  const { t, language } = useLanguage();
  const { isVisited, visited } = useVisited();
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [orbitReplay, setOrbitReplay] = useState(0);
  const [orbitComplete, setOrbitComplete] = useState(false);

  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;
    setOrbitComplete(false);
    if (orbitReplay === 0 && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOrbitComplete(true); return; }
    let frame = 0;
    let disposed = false;
    const layer = document.createElement('div');
    layer.className = 'home-orbit-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const words = Array.from(headline.querySelectorAll<HTMLElement>('[data-orbit-word]'));
    const originalPaws = Array.from(headline.querySelectorAll<SVGSVGElement>('.home-story-paws svg'));
    const reset = () => {
      layer.replaceChildren();
      words.forEach((word) => { word.style.visibility = ''; });
      originalPaws.forEach((paw) => { paw.style.visibility = ''; });
    };
    const timer = window.setTimeout(async () => {
      await document.fonts.ready;
      if (disposed) return;
      const viewportSize = Math.min(window.innerWidth, window.innerHeight);
      const radius = Math.max(60, viewportSize * 0.43);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Measure each letter at rest, then place it on a shared circular baseline.
      const letters = words.flatMap((word, wordIndex) => {
        const style = getComputedStyle(word);
        return Array.from(word.querySelectorAll<HTMLElement>('[data-orbit-letter]')).map((letter) => {
          const bounds = letter.getBoundingClientRect();
          const clone = document.createElement('span');
          clone.textContent = letter.textContent;
          Object.assign(clone.style, {
            position: 'absolute', left: '0', top: '0', whiteSpace: 'pre',
            font: style.font, letterSpacing: style.letterSpacing, color: '#fff',
            width: `${bounds.width}px`, height: `${bounds.height}px`,
            textAlign: 'center', transformOrigin: 'center',
          });
          layer.appendChild(clone);
          const fontSize = parseFloat(style.fontSize);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          context.font = style.font;
          const metrics = context.measureText(letter.textContent ?? '');
          const baseline = (bounds.height - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
          const dotX = metrics.actualBoundingBoxRight - fontSize * 0.06 - bounds.width / 2;
          const dotTop = baseline - metrics.actualBoundingBoxAscent - bounds.height / 2;
          return { clone, bounds, wordIndex, width: bounds.width, dotX, dotTop, dot: word.dataset.orbitWord === 'find' && letter.textContent === 'i' ? 0 : word.dataset.orbitWord === 'it' && letter.textContent === 'i' ? 1 : -1 };
        });
      });
      // Reveal the paws in sequence on a separate orbit around the words.
      const paws = Array.from(headline.querySelectorAll<SVGSVGElement>('.home-story-paws svg')).map((paw, index) => {
        const bounds = paw.getBoundingClientRect();
        const clone = paw.cloneNode(true) as SVGSVGElement;
        clone.removeAttribute('class');
        Object.assign(clone.style, {
          position: 'absolute', left: '0', top: '0', color: '#fff',
          width: `${bounds.width}px`, height: `${bounds.height}px`,
          opacity: '0', transformOrigin: 'center',
        });
        layer.appendChild(clone);
        return { clone, bounds, wordIndex: words.length + index * 3, width: bounds.width, dotX: 0, dotTop: 0, dot: -1, paw: true };
      });
      const orbitItems = [...letters.map((letter) => ({ ...letter, paw: false })), ...paws];
      const totalWidth = letters.reduce((sum, letter) => sum + letter.width, 0);
      const gap = totalWidth * 0.045;
      const scale = 0.72 * Math.PI * 2 * radius / (totalWidth + gap * words.length);
      // Keep oversized glyphs near the edges without clipping the circle.
      const tallest = Math.max(...letters.map((letter) => letter.bounds.height)) * scale;
      const orbitRadius = Math.max(40, viewportSize / 2 - tallest / 2 - 8);
      const circumference = totalWidth + gap * words.length;
      let distance = 0;
      let previousWord = 0;
      const positioned = orbitItems.map((letter) => {
        if (letter.wordIndex !== previousWord) distance += gap;
        previousWord = letter.wordIndex;
        const pawIndex = (letter.wordIndex - words.length) / 3;
        // Stagger the paws above and below the words.
        const pawAngles = [-2.3, 2.25];
        const angle = letter.paw
          ? pawAngles[pawIndex] + (Math.random() - 0.5) * 0.22
          : -Math.PI / 2 + (distance + letter.width / 2) / circumference * Math.PI * 2;
        distance += letter.width;
        return { ...letter, angle, radialOffset: letter.paw ? [30, -30][pawIndex] : 0 };
      });
      const dotLetters = positioned.filter((item) => !item.paw && item.dot >= 0);
      const dotPoses = new Map<number, { x: number; y: number; tilt: number; scale: number }>();
      const started = performance.now();
      const stagger = 320;
      const entrance = 2600;
      const assembledAt = entrance + (words.length + 3) * stagger;
      const orbitDuration = 12000;
      const returnAt = assembledAt + orbitDuration;
      const finishAt = returnAt + assembledAt;
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      const ease = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);
      const tick = (now: number) => {
        if (disposed) return;
        const elapsed = now - started;
        const rotation = -ease(clamp((elapsed - assembledAt) / orbitDuration)) * Math.PI * 2;
        words.forEach((word) => { word.style.visibility = 'hidden'; });
        originalPaws.forEach((paw) => { paw.style.visibility = 'hidden'; });
        positioned.forEach((item) => {
          const { clone, bounds, wordIndex, angle, paw, radialOffset } = item;
          const arrival = ease(clamp((elapsed - wordIndex * stagger) / entrance));
          const departure = ease(clamp((elapsed - returnAt - wordIndex * stagger) / entrance));
          const blend = arrival * (1 - departure);
          clone.style.opacity = String(paw
            ? ease(clamp((elapsed - wordIndex * stagger) / 900))
            : 1 - 0.45 * blend);
          const itemRadius = paw
            ? Math.min(orbitRadius + radialOffset, viewportSize / 2 - bounds.height * scale / 2 - 8)
            : orbitRadius;
          const theta = angle + rotation;
          const originX = bounds.left + bounds.width / 2;
          const originY = bounds.top + bounds.height / 2;
          let x = originX + (centerX + Math.cos(theta) * itemRadius - originX) * blend;
          let y = originY + (centerY + Math.sin(theta) * itemRadius - originY) * blend;
          // Keep the completed revolution constant during the return to avoid an extra spin.
          let tilt = (angle + Math.PI / 2) * blend + rotation;
          let itemScale = 1 + (scale - 1) * blend;
          if (!paw && item.dot >= 0) {
            dotPoses.set(item.dot, { x, y, tilt, scale: itemScale });
            const pawArrival = clamp((elapsed - (words.length + item.dot * 3) * stagger) / 900);
            // Hide only the cloned i dot while its paw replaces it; restore it on return.
            clone.textContent = pawArrival > 0.5 && elapsed < returnAt ? 'ı' : 'i';
          }
          if (paw) {
            const dotIndex = (wordIndex - words.length) / 3;
            const letter = dotLetters.find((letter) => letter.dot === dotIndex);
            const pose = dotPoses.get(dotIndex);
            if (letter && pose) {
              // Use the i's live transform and measured glyph top, so alignment
              // holds throughout the revolution instead of drifting on another orbit.
              const localX = (letter.dotX - letter.bounds.height * 0.035) * pose.scale;
              const localY = (letter.dotTop + letter.bounds.height * 0.025) * pose.scale;
              const attachedX = pose.x + Math.cos(pose.tilt) * localX - Math.sin(pose.tilt) * localY;
              const attachedY = pose.y + Math.sin(pose.tilt) * localX + Math.cos(pose.tilt) * localY;
              x = attachedX + (originX - attachedX) * departure;
              y = attachedY + (originY - attachedY) * departure;
              tilt = pose.tilt * (1 - departure) + rotation * departure;
              itemScale = pose.scale * 0.66 + (1 - pose.scale * 0.66) * departure;
            }
          }
          clone.style.transform = `translate(${x - bounds.width / 2}px, ${y - bounds.height / 2}px) rotate(${tilt}rad) scale(${itemScale})`;
        });
        if (elapsed < finishAt) frame = window.requestAnimationFrame(tick);
        else { reset(); setOrbitComplete(true); }
      };
      frame = window.requestAnimationFrame(tick);
    }, orbitReplay > 0 ? 0 : 1400);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      reset();
      layer.remove();
    };
  }, [orbitReplay, language]);
  const renderWords = (text: string) => text.split(/\s+/).map((word, index) => (
    <span key={`${word}-${index}`}><span data-orbit-word={word} className="inline-block">{Array.from(word).map((letter, letterIndex) => <span key={letterIndex} data-orbit-letter>{letter}</span>)}</span>{' '}</span>
  ));
  const totalVisited = ARTWORKS.filter((a) => visited.includes(a.id)).length;
  const previewTour = TOURS[0];
  const previewStops = tourStops(previewTour);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroImageIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grain min-h-full">
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-5 sm:px-8">
        <nav className="relative z-10 flex items-center justify-between text-white">
          <a href="#/" className="flex items-center gap-2" aria-label="Public ArtWalk - Paw home">
            <img src="/favicon.svg" alt="" width={30} height={30} />
            <span className="font-display text-base font-semibold leading-tight tracking-tight sm:text-xl">Public ArtWalk - Paw</span>
          </a>
          <div className="flex items-center gap-2">
            <span className="location-badge hidden lg:block rounded-full border px-3 py-1.5 text-xs font-semibold">📍 Downtown Vancouver</span>
            <LanguageButton />
            <ProfileButton />
          </div>
        </nav>

        <div className="hero-slideshow">
          <div className="hero-slideshow-images" aria-hidden="true">
            {HERO_IMAGES.map((image, index) => (
              <img
                key={image.src}
                src={image.src}
                alt=""
                className={`hero-slideshow-image ${index === heroImageIndex ? 'is-active' : ''}`}
              />
            ))}
          </div>

        <header className="rise pb-8 pt-10 text-center sm:pt-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-vermilion">{t('Your personal city art storyteller')}</p>
          <h1 ref={headlineRef} className="home-story-orbit mx-auto max-w-3xl font-display text-[36px] font-semibold leading-[1.02] tracking-tight sm:text-[56px]">
            {renderWords(t('Every corner has a story.'))} <span className="inline-block italic text-ink-2">{renderWords(t('Go find it'))}<span className={`home-story-paws ${orbitComplete ? 'is-visible' : ''}`} aria-hidden="true">{[0, 1].map((paw) => <svg key={paw} viewBox="0 0 64 64" fill="currentColor"><ellipse cx="15" cy="26" rx="6" ry="8" transform="rotate(-25 15 26)" /><ellipse cx="26" cy="17" rx="6" ry="8" /><ellipse cx="39" cy="17" rx="6" ry="8" /><ellipse cx="50" cy="26" rx="6" ry="8" transform="rotate(25 50 26)" /><path d="M32 30c-6 0-9 6-13 11-4 5-3 12 3 13 4 1 7-2 10-2s6 3 10 2c6-1 7-8 3-13-4-5-7-11-13-11Z" /></svg>)}</span></span>
          </h1>
          <button type="button" onClick={() => setOrbitReplay((value) => value + 1)} className="mx-auto mt-4 rounded-full border border-white/50 px-4 py-2 text-sm text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {language === 'zh' ? '↻ 重播动画' : language === 'fr' ? '↻ Rejouer' : '↻ Replay animation'}
          </button>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
            {t('Pick a themed walk, listen to the story behind each artwork as you arrive, and look closer with small observation challenges along the way.')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-2">
            <span>
              <strong className="font-display text-lg text-ink">{ARTWORKS.length}</strong> {t('public artworks')}
            </span>
            <span>
              <strong className="font-display text-lg text-ink">{TOURS.length}</strong> {t('curated walks')}
            </span>
            <span>
              <strong className="font-display text-lg text-ink">{totalVisited}</strong> {t('artworks visited by you')}
            </span>
          </div>
        </header>

        <section className="hero-wander" aria-label="Explore artworks">
          <a
            href={href({ view: 'explore' })}
            className="rise wander-link mb-5 flex items-center gap-4 rounded-3xl border border-dashed border-ink/25 p-5"
            style={{ animationDelay: '260ms' }}
          >
            <span className="wander-icon grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-2xl text-paper" aria-hidden>
              ✦
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl font-semibold">{t('Wander freely')}</span>
              <span className="wander-description block text-sm text-ink-2">
                {t('All {count} artworks on one map — filter, search, and find what’s nearest to you.').replace('{count}', String(ARTWORKS.length))}
              </span>
            </span>
            <span className="text-xl" aria-hidden>
              →
            </span>
          </a>
        </section>

        </div>

        <section
          className="walks-section px-5 pb-8 pt-12 text-[#1c1a17]"
          aria-labelledby="walks"
        >
          <h2 id="walks" className="mb-4 font-display text-3xl font-semibold sm:text-4xl">
            {t('Choose a walk')}
          </h2>
          <div className="grid grid-cols-1 gap-5">
            {TOURS.map((tour, ti) => {
              const stops = tourStops(tour);
              const km = walkingEstimate(stops.map((s) => s.art));
              const walkScoreAreas = tour.walkScoreAreas.join(', ');
              const walkScoreLabel = language === 'zh'
                ? `步行评分估算：${walkScoreAreas} 的 Walk Score 地点评分平均值；来源：walkscore.com。`
                : language === 'fr'
                  ? `Score Walk estimé : moyenne des scores Walk Score représentatifs pour ${walkScoreAreas} ; source : walkscore.com.`
                  : `Estimated average of representative Walk Score ratings for ${walkScoreAreas}; source: walkscore.com.`;
              const done = stops.filter((s) => isVisited(s.art.id)).length;
              const pct = (done / stops.length) * 100;
              return (
                <a
                  key={tour.id}
                  href={href({ view: 'tour', tourId: tour.id })}
                  className="rise group flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_1px_0_rgb(28_26_23/0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-18px_rgb(28_26_23/0.45)]"
                  style={{ animationDelay: `${80 + ti * 80}ms` }}
                >
                  <div className="grid h-40 grid-cols-3 gap-0.5 bg-line">
                    {stops.slice(0, 3).map(({ art }) => (
                      <ArtCover key={art.id} art={art} compact className="h-full" />
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: tour.accent }}>
                      {tour.theme}
                    </p>
                    <h3 className="mt-1 font-display text-[28px] font-semibold leading-tight">{tour.title}</h3>
                    <p className="mt-1 text-ink-2">{tour.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full px-2.5 py-1" style={{ background: tour.accentSoft, color: tour.accent }}>
                        ⏱ ~{tour.minutes} {t('min')}
                      </span>
                      <span className="rounded-full bg-paper-2 px-2.5 py-1">{formatDistance(km)}</span>
                      <span className="rounded-full bg-paper-2 px-2.5 py-1">🎧 {t('audio')}</span>
                      <span className="rounded-full bg-paper-2 px-2.5 py-1">{stops.length} {language === 'zh' ? '站' : t('stops')}</span>
                      <span
                        className="rounded-full bg-paper-2 px-2.5 py-1"
                        title={walkScoreLabel}
                        aria-label={`${t('Walk Score estimate')}: ${tour.walkScore}. ${walkScoreLabel}`}
                      >
                        {t('Walk Score')} ~{tour.walkScore}
                      </span>
                    </div>
                    <div
                      className="relative mt-5 flex items-center justify-between px-1"
                      role="img"
                      aria-label={`${stops.length} stops along this walk`}
                      style={{ color: tour.accent }}
                    >
                      <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2" style={{ background: `${tour.accent}55` }} aria-hidden="true" />
                      {stops.map(({ art }, stopIndex) => (
                        <span
                          key={art.id}
                          className="relative z-10 h-3.5 w-3.5 rounded-full border-2 border-card shadow-[0_0_0_2px_var(--color-card)]"
                          style={{ background: isVisited(art.id) ? tour.accent : 'var(--color-paper-2)', borderColor: tour.accent }}
                          title={`Stop ${stopIndex + 1}: ${art.title}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="mt-auto pt-5">
                      {done > 0 && (
                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-paper-2" aria-hidden>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tour.accent }} />
                        </div>
                      )}
                      <span
                        className="inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold text-white transition group-hover:gap-3"
                        style={{ background: tour.accent }}
                      >
                        {done === 0 ? 'Start the walk' : done === stops.length ? 'Completed ✓ · Revisit' : `Continue · ${done}/${stops.length}`}
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-10 sm:gap-12" aria-label={t('How ArtWalk works')}>
          {[
            ['01', 'Pick a walk', 'Two curated routes through Downtown, each under an hour.'],
            ['02', 'Listen as you arrive', 'Every stop has a narrated story with a readable transcript.'],
            ['03', 'Look closer', 'Spot details, answer a question, and collect each stop.'],
          ].map(([n, title, description]) => (
            <div
              key={n}
              className={`grid grid-cols-2 items-center gap-4 py-3 sm:gap-6 lg:justify-center ${n === '02' ? 'lg:grid-cols-[24rem_28rem]' : 'lg:grid-cols-[28rem_24rem]'}`}
            >
              <div className={n === '02' ? 'order-2 w-full max-w-[19rem] justify-self-end' : ''}>
                <p className="font-display text-sm font-semibold text-vermilion">{n}</p>
                <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">{t(title)}</p>
                <p className="mt-2 max-w-[19rem] text-base leading-relaxed text-ink-2 sm:text-lg">{t(description)}</p>
              </div>
              {n === '01' && (
                <div className="h-56 w-full max-w-96 justify-self-end overflow-hidden rounded-2xl border border-line shadow-sm" role="region" aria-label={`${previewTour.title} route preview map`}>
                  <ArtMap
                    mode="tour"
                    points={previewStops.map(({ art }, index) => ({ art, label: String(index + 1) }))}
                    path={previewStops.map(({ art }) => [art.lat, art.lon])}
                    accent={previewTour.accent}
                    fitKey="home-waterfront-route-preview"
                    onSelect={() => navigate({ view: 'tour', tourId: previewTour.id })}
                  />
                </div>
              )}
              {n === '02' && previewStops[0] && <div className="order-1 w-full max-w-96 justify-self-start"><ListenFeaturePreview art={previewStops[0].art} /></div>}
              {n === '03' && previewStops[0] && <div className="w-full max-w-96 justify-self-end"><Challenge art={previewStops[0].art} prompt={previewStops[0].stop.prompt} accent={previewTour.accent} /></div>}
            </div>
          ))}
        </section>

        <CommunityHub />

        <footer className="mt-16 border-t border-line pt-5 text-xs leading-relaxed text-ink-3">
          Artwork data from the{' '}
          <a className="underline" href="https://opendata.vancouver.ca/explore/dataset/public-art/" target="_blank" rel="noreferrer">
            City of Vancouver Public Art Registry
          </a>
          , licensed under the Open Government Licence – Vancouver. Map © OpenStreetMap contributors © CARTO. Public ArtWalk - Paw is a hackathon prototype; progress is stored only on this device.
        </footer>
      </div>
    </div>
  );
}
