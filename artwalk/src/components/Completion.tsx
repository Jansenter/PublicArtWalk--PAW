import { useEffect, useRef, useState } from 'react';
import { TOURS, type Tour } from '../data/tours';
import { formatDistance } from '../lib/geo';
import { href, navigate } from '../lib/router';
import { useLanguage } from '../lib/language';

export default function Completion({
  tour,
  metres,
  stops,
  challengesDone,
  challengesRight,
  onClose,
}: {
  tour: Tour;
  metres: number;
  stops: number;
  challengesDone: number;
  challengesRight: number;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const other = TOURS.find((t) => t.id !== tour.id);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareError, setShareError] = useState('');
  const shareUrl = new URL(href({ view: 'tour', tourId: tour.id }), window.location.href).href;
  const shareText = `I just completed “${tour.title}” on Public ArtWalk - Paw — ${stops} public artworks across ${formatDistance(metres)} of Downtown Vancouver. 🎨`;
  const socialLinks = [
    { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Instagram', url: 'https://www.instagram.com/' },
  ];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copyLink = async () => {
    setShareError('');
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setShareError(language === 'zh' ? '无法复制，请手动复制下方链接。' : language === 'fr' ? 'Copie impossible. Copiez le lien ci-dessous.' : 'Couldn’t copy. Please copy the link below.');
    }
  };

  const share = async () => {
    setShareError('');
    try {
      await navigator.share({ title: 'Public ArtWalk - Paw', text: shareText, url: shareUrl });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setShareError(language === 'zh' ? '请使用下方分享选项。' : language === 'fr' ? 'Utilisez les options ci-dessous.' : 'Please use one of the sharing options below.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] grid place-items-center bg-ink/55 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="done-title">
      <div className="pop w-full max-h-[90dvh] max-w-sm overflow-y-auto rounded-3xl bg-card shadow-2xl">
        <div className="relative grid place-items-center px-6 pb-6 pt-8 text-white" style={{ background: tour.accent }}>
          <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="4 6" />
            <circle cx="48" cy="48" r="34" fill="#fffdf8" />
            <path d="M33 49l10 10 20-22" fill="none" stroke={tour.accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/80">{t('Walk complete')}</p>
          <h2 id="done-title" className="mt-1 text-center font-display text-3xl font-semibold leading-tight">
            {tour.title}
          </h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
          <Stat value={String(stops)} label={t('artworks')} />
          <Stat value={formatDistance(metres)} label={language === 'zh' ? '步行' : t('walked')} />
          <Stat value={challengesDone ? `${challengesRight}/${challengesDone}` : '—'} label={t('challenges')} />
        </div>
        <div className="space-y-2 p-5">
          <p className="pb-2 text-center text-sm text-ink-2">You’ve discovered the stories hidden in your city. Thanks for looking closer.</p>
          <button onClick={() => setShowShare(!showShare)} aria-expanded={showShare} aria-controls="walk-share-options" className="h-12 w-full rounded-full bg-ink font-semibold text-paper">
            {t('Share your walk')}
          </button>
          {showShare && (
            <div id="walk-share-options" className="space-y-2 rounded-2xl border border-line p-3">
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map(({ name, url }) => (
                  <a key={name} href={url} onClick={name === 'Instagram' ? () => { void copyLink(); } : undefined} target="_blank" rel="noopener noreferrer" aria-label={`${t('Share your walk')} — ${name}`} className="grid min-h-11 place-items-center rounded-full border border-line px-3 text-sm font-semibold">
                    {name}
                  </a>
                ))}
              </div>
              <p className="text-center text-xs text-ink-2">
                {language === 'zh' ? 'Instagram：复制链接后打开应用，请粘贴分享。' : language === 'fr' ? 'Instagram : le lien est copié. Collez-le pour le partager.' : 'Instagram copies the link and opens Instagram. Paste the link to share.'}
              </p>
              <button onClick={copyLink} className="min-h-11 w-full rounded-full border border-line text-sm font-semibold">
                {copied ? (language === 'zh' ? '已复制 ✓' : language === 'fr' ? 'Lien copié ✓' : 'Link copied ✓') : (language === 'zh' ? '复制链接' : language === 'fr' ? 'Copier le lien' : 'Copy link')}
              </button>
              {typeof navigator.share === 'function' && (
                <button onClick={share} className="min-h-11 w-full rounded-full border border-line text-sm font-semibold">
                  {language === 'zh' ? '更多应用…' : language === 'fr' ? 'Autres applications…' : 'More apps…'}
                </button>
              )}
              <p role="status" className="text-center text-xs text-ink-2">
                {shareError || (copied ? (language === 'zh' ? '链接已复制到剪贴板。' : language === 'fr' ? 'Lien copié dans le presse-papiers.' : 'Link copied to clipboard.') : '')}
              </p>
              {shareError && <input aria-label="Walk link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded-lg border border-line bg-card p-2 text-xs" />}
            </div>
          )}
          {other && (
            <button
              onClick={() => {
                onClose();
                navigate({ view: 'tour', tourId: other.id });
              }}
              className="h-12 w-full rounded-full border border-line font-semibold"
            >
              {language === 'zh' ? `接下来尝试“${other.title}”` : language === 'fr' ? `Essayez « ${other.title} » ensuite` : `Try “${other.title}” next`}
            </button>
          )}
          <button ref={closeRef} onClick={onClose} className="h-10 w-full text-sm font-semibold text-ink-3">
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 py-4">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">{label}</p>
    </div>
  );
}
