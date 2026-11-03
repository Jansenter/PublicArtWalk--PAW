import { photosFor } from '../lib/artwork-photos';
import { categoryOf, type Artwork } from '../lib/data';

/**
 * The open-data export has no photos, so every artwork gets a deterministic generative
 * "poster" based on its category and registry id. It is decorative — the real artwork is
 * one tap away on the City registry page.
 */

const PALETTES: Record<string, [string, string, string, string]> = {
  sculpture: ['#1c1a17', '#e2512f', '#f2c14e', '#efe6d5'],
  site: ['#0e6e6a', '#1c1a17', '#9cc9c1', '#eef3ee'],
  memorial: ['#3d3a35', '#a4461b', '#d9c7a8', '#f3ece0'],
  water: ['#14527a', '#3fa7c9', '#bfe3ee', '#f1f6f7'],
  wall: ['#7b2d5b', '#f2994a', '#f5d17c', '#f6eee2'],
  indigenous: ['#7a1f1f', '#1c1a17', '#d98b5f', '#f3e9dc'],
  media: ['#272a5c', '#6a5acd', '#f1b6d0', '#efeef6'],
};


function rng(seed: number) {
  let t = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0; // mulberry32 with a mixed seed
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ArtCover({ art, className = '', compact = false }: { art: Artwork; className?: string; compact?: boolean }) {
  const photo = photosFor(art)[0]?.src;
  const cat = categoryOf(art.type);
  const [a, b, c, bg] = PALETTES[cat] ?? PALETTES.sculpture;
  const r = rng(art.id);
  const W = 400;
  const H = 260;
  const shapes: React.ReactNode[] = [];

  switch (cat) {
    case 'site': {
      const n = 7;
      const s = W / n;
      for (let x = 0; x < n; x++)
        for (let y = 0; y < 5; y++) {
          const v = r();
          if (v > 0.55) shapes.push(<rect key={`${x}-${y}`} x={x * s + 4} y={y * s + 4} width={s - 8} height={s - 8} fill={v > 0.85 ? b : v > 0.7 ? a : c} rx={v > 0.92 ? s : 2} />);
        }
      break;
    }
    case 'water':
      for (let i = 0; i < 9; i++) {
        const y = 30 + i * 26;
        const amp = 8 + r() * 14;
        const ph = r() * 80;
        shapes.push(
          <path
            key={i}
            d={`M -20 ${y} C ${60 + ph} ${y - amp}, ${140 + ph} ${y + amp}, 220 ${y} S ${360 - ph} ${y - amp}, 440 ${y}`}
            fill="none"
            stroke={i % 3 === 0 ? a : i % 3 === 1 ? b : c}
            strokeWidth={i % 3 === 0 ? 10 : 6}
            strokeLinecap="round"
          />,
        );
      }
      break;
    case 'memorial': {
      const x = 120 + r() * 160;
      shapes.push(<rect key="ground" x={0} y={200} width={W} height={60} fill={c} />);
      shapes.push(<path key="arch" d={`M ${x - 70} 200 V 110 A 70 70 0 0 1 ${x + 70} 110 V 200 Z`} fill={b} opacity={0.9} />);
      shapes.push(<path key="obelisk" d={`M ${x - 16} 200 L ${x - 10} 60 L ${x} 40 L ${x + 10} 60 L ${x + 16} 200 Z`} fill={a} />);
      shapes.push(<circle key="sun" cx={x + 110 * (r() > 0.5 ? 1 : -1)} cy={70} r={22} fill={c} />);
      break;
    }
    case 'wall':
      for (let x = 0; x < 10; x++)
        for (let y = 0; y < 7; y++) {
          const v = r();
          shapes.push(<rect key={`${x}-${y}`} x={x * 40 + 2} y={y * 40 + 2} width={36} height={36} fill={v > 0.66 ? a : v > 0.33 ? b : c} rx={v > 0.9 ? 18 : 3} opacity={0.92} />);
        }
      break;
    case 'indigenous':
      for (let i = 0; i < 5; i++) {
        const y = 10 + i * 50;
        shapes.push(<rect key={`band${i}`} x={160} y={y} width={80} height={44} rx={22} fill={i % 2 ? b : a} />);
        shapes.push(<circle key={`eye${i}`} cx={185} cy={y + 22} r={7} fill={c} />);
        shapes.push(<circle key={`eye2${i}`} cx={215} cy={y + 22} r={7} fill={c} />);
      }
      shapes.push(<rect key="l" x={0} y={0} width={110} height={H} fill={c} opacity={0.5} />);
      shapes.push(<rect key="r" x={290} y={0} width={110} height={H} fill={c} opacity={0.5} />);
      break;
    case 'media':
      for (let i = 0; i < 6; i++) {
        const p = i * 22;
        shapes.push(<rect key={i} x={40 + p} y={20 + p * 0.6} width={W - 80 - p * 2} height={H - 40 - p * 1.2} rx={10} fill="none" stroke={i % 2 ? b : a} strokeWidth={8} />);
      }
      shapes.push(<circle key="c" cx={W / 2} cy={H / 2} r={18} fill={c} />);
      break;
    default: {
      const cx = 110 + r() * 180;
      shapes.push(<circle key="big" cx={cx} cy={140} r={80 + r() * 30} fill={b} />);
      shapes.push(<rect key="block" x={cx - 30 + r() * 60} y={60} width={70} height={150} fill={a} transform={`rotate(${r() * 30 - 15} ${cx} 135)`} />);
      shapes.push(<path key="arc" d={`M 20 ${200 + r() * 30} Q ${W / 2} ${20 + r() * 40} ${W - 20} ${190 + r() * 30}`} fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" />);
      shapes.push(<circle key="dot" cx={W - 60 - r() * 60} cy={50} r={14} fill={c} />);
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      {photo ? (
        <img
          src={photo}
          loading="lazy"
          alt=""
          className="block h-full w-full object-cover"
          style={{ objectPosition: art.id === 438 ? 'center 38%' : 'center' }}
        />
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
          <rect width={W} height={H} fill={bg} />
          {shapes}
        </svg>
      )}
      {!compact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/45 to-transparent px-4 pb-3 pt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/95">
          <span>{art.type}</span>
          {art.year && <span>{art.year}</span>}
        </div>
      )}
    </div>
  );
}
