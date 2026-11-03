import type { ReactNode } from 'react';
import { useProfile } from '../lib/profile';
import { href } from '../lib/router';
import { useLanguage, type Language } from '../lib/language';

export function LanguageButton() {
  const { language, setLanguage, t } = useLanguage();
  const options: { value: Language; label: string }[] = [{ value: 'zh', label: '中文' }, { value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }];
  return <div className="relative">
    <label className="sr-only" htmlFor="language-picker">{t('Change language')}</label>
    <select id="language-picker" value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t('Change language')} title={t('Change language')} className="h-11 rounded-full border-0 bg-card px-3 text-sm font-semibold text-ink shadow-[0_2px_10px_rgb(28_26_23/0.18)]">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>;
}

export function ProfileButton() {
  const [profile] = useProfile();
  const { language } = useLanguage();
  const name = profile.name.trim();
  const label = name
    ? (language === 'zh' ? `${name}的个人资料` : language === 'fr' ? `Profil de ${name}` : `${name}’s profile`)
    : (language === 'zh' ? '创建个人资料' : language === 'fr' ? 'Créer un profil' : 'Create profile');
  return (
    <a href={href({ view: 'profile' })} aria-label={label} title={label} className="flex h-11 min-w-11 max-w-40 shrink-0 items-center justify-center gap-2 rounded-full bg-card px-3 text-sm font-semibold text-ink shadow-[0_2px_10px_rgb(28_26_23/0.18)]">
      {name ? <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-paper">{Array.from(name)[0].toLocaleUpperCase()}</span> : (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </svg>
      )}
      {name && <span className="hidden truncate sm:block">{name}</span>}
    </a>
  );
}

/**
 * Responsive map + panel layout.
 *  - Phone: map on top (~46% height), panel below; an open story covers the screen.
 *  - Desktop: panel (list or story) in a 440px left column, map fills the rest.
 */
export default function Shell({ header, map, panel, story }: { header: ReactNode; map: ReactNode; panel: ReactNode; story?: ReactNode }) {
  return (
    <div className="flex h-full flex-col md:grid md:grid-cols-[440px_1fr] md:grid-rows-1">
      <div className="relative order-2 flex min-h-0 flex-1 flex-col border-line bg-paper md:order-1 md:border-r">
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{panel}</div>
        {story && <div className="fixed inset-0 z-[1200] md:absolute md:z-10">{story}</div>}
      </div>
      <div className="relative order-1 h-[46svh] shrink-0 md:order-2 md:h-full">{map}<div className="absolute right-3 top-3 z-[1000]"><ProfileButton /></div></div>
    </div>
  );
}

export function IconButton({ label, onClick, children, className = '' }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-full bg-card text-ink shadow-[0_2px_10px_rgb(28_26_23/0.18)] transition hover:bg-white active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

export const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const LocateIcon = ({ on }: { on: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? '#2b6cdf' : 'currentColor'} strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" fill={on ? '#2b6cdf' : 'none'} />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);
