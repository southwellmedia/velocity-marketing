import { useRef, useCallback } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Image imports — Vite eager glob at build time
// ---------------------------------------------------------------------------
const showcaseImages = import.meta.glob<string | { src?: string; default?: string }>(
  '/src/assets/showcase/*.png',
  { eager: true, import: 'default' },
);

function resolveImage(slug: string): string | undefined {
  const key = `/src/assets/showcase/${slug}.png`;
  const val = showcaseImages[key];
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  return val.src ?? val.default ?? undefined;
}

// ---------------------------------------------------------------------------
// Spring configs
// ---------------------------------------------------------------------------
const SPRINGS = {
  ENTRANCE: { stiffness: 80, damping: 14, mass: 0.8 },
  TILT: { stiffness: 200, damping: 24, mass: 0.5 },
  SCALE: { stiffness: 300, damping: 30, mass: 0.3 },
} as const;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
interface ShowcaseItem {
  slug: string;
  name: string;
  url: string;
  category: string;
  accent: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    slug: 'southwell-media',
    name: 'Southwell Media',
    url: 'http://southwellmedia.com',
    category: 'Digital Agency',
    accent: '#a0a0a0',
  },
  {
    slug: 'kirsch-velocity',
    name: 'Kirsch',
    url: 'https://kirsch-velocity.vercel.app',
    category: 'Luxury Real Estate',
    accent: '#c4a265',
  },
  {
    slug: 'deploy-velocity',
    name: 'Deploy Velocity',
    url: 'https://deployvelocity.com',
    category: 'Developer Tools',
    accent: 'var(--color-brand-500)',
  },
  {
    slug: 'ridgecut',
    name: 'Ridgecut',
    url: 'https://ridgecut.vercel.app',
    category: 'Roofing & Construction',
    accent: '#c4a265',
  },
  {
    slug: 'the-haven-castle-hills',
    name: 'The Haven',
    url: 'https://thehavencastlehills.com',
    category: 'Real Estate',
    accent: '#34d399',
  },
  {
    slug: 'green-door-26',
    name: 'Green Door',
    url: 'https://greendoor26.vercel.app',
    category: 'Waste Management',
    accent: '#4ade80',
  },
];

// ---------------------------------------------------------------------------
// TiltCard — 3D perspective hover
// ---------------------------------------------------------------------------
function TiltCard({
  children,
  className = '',
  strength = 8,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, SPRINGS.TILT);
  const rotateY = useSpring(0, SPRINGS.TILT);
  const scale = useSpring(1, SPRINGS.SCALE);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * strength);
      rotateX.set(-y * strength);
    },
    [disabled, strength, rotateX, rotateY],
  );

  const handleEnter = useCallback(() => {
    if (!disabled) scale.set(1.015);
  }, [disabled, scale]);

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1200,
      }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ShowcaseCard — Image-forward card with hover-reveal text
// ---------------------------------------------------------------------------
function ShowcaseCard({
  item,
  index,
  featured = false,
  reducedMotion,
  inView,
}: {
  item: ShowcaseItem;
  index: number;
  featured?: boolean;
  reducedMotion: boolean;
  inView: boolean;
}) {
  const image = resolveImage(item.slug);

  return (
    <motion.div
      className="h-full"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: featured ? 40 : 30 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.1 + index * 0.08 }}
    >
      <TiltCard
        className="group relative h-full overflow-hidden rounded-lg"
        strength={featured ? 3 : 8}
        disabled={reducedMotion}
      >
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-deep"
        >
          <div className="relative h-full min-h-[240px] overflow-hidden">
            {/* Screenshot — full bleed, grayscale by default */}
            {image && (
              <img
                src={image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out grayscale group-hover:grayscale-0 group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
              />
            )}

            {/* Subtle permanent vignette at edges — defines card boundary */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.04)',
                background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 30%)',
              }}
            />

            {/* Hover overlay — dark curtain rising from bottom */}
            <div
              className="showcase-card-overlay absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.25) 80%, transparent 100%)',
              }}
            />

            {/* Text content — revealed on hover with stagger */}
            <div className={`absolute inset-0 flex flex-col justify-end ${featured ? 'p-7 md:p-10' : 'p-5'}`}>
              {/* Category label */}
              <div className="showcase-card-text showcase-stagger-1 flex items-center gap-2.5 mb-2.5">
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: item.accent }}
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
                  {item.category}
                </span>
              </div>

              {/* Site name */}
              <h3
                className="showcase-card-text showcase-stagger-2 font-display font-bold text-white tracking-tight leading-[1.1]"
                style={{ fontSize: featured ? 'clamp(1.5rem, 3vw, 2.5rem)' : 'var(--text-lg)' }}
              >
                {item.name}
              </h3>

              {/* Arrow indicator */}
              <div className="showcase-card-text showcase-stagger-3 mt-3 inline-flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em]">
                  View
                </span>
                <svg
                  className="w-3 h-3 -translate-x-1 group-hover:translate-x-0 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </div>
            </div>
          </div>

          {/* Border — subtle, brightens on hover */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-500"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          />
          <div
            className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 30px rgba(0,0,0,0.3)',
            }}
          />
        </a>
      </TiltCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SubmitCTA — Community submission call-to-action
// ---------------------------------------------------------------------------
function SubmitCTA({
  reducedMotion,
  inView,
}: {
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      className="mt-16 md:mt-20"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.5 }}
    >
      <div className="h-px mb-12 md:mb-14 bg-border" aria-hidden="true" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h3
            className="font-display font-semibold text-foreground tracking-tight"
            style={{ fontSize: 'var(--text-2xl)' }}
          >
            Built something with Velocity?
          </h3>
          <p className="mt-2 text-sm leading-relaxed max-w-md text-foreground-muted">
            We'd love to see it. Submit your site and we'll feature it in the showcase.
          </p>
        </div>

        <a
          href="#"
          className="group inline-flex items-center gap-2.5 shrink-0 rounded-md h-10 px-5 text-sm font-medium border border-brand-500 text-brand-500 bg-transparent hover:bg-brand-500 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="font-mono uppercase tracking-wider text-xs">
            Submit your site
          </span>
          <svg
            className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Showcase — Main exported component
// ---------------------------------------------------------------------------
export default function Showcase() {
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="showcase"
      ref={ref}
      className="bg-noise relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background-deep)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
      }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(249,76,16,0.045) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container relative">
        {/* Section header */}
        <motion.header
          style={{ marginBottom: 'var(--space-section-header)' }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
          animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
          transition={SPRINGS.ENTRANCE}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-px w-10"
              style={{
                background:
                  'linear-gradient(to right, transparent, var(--color-brand-500))',
              }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-500/60">
              Showcase
            </span>
          </div>

          <h2
            className="font-display font-bold tracking-tight text-foreground"
            style={{ fontSize: 'var(--text-4xl)' }}
          >
            Built with Velocity
          </h2>
          <p className="mt-4 text-lg max-w-xl text-foreground-muted">
            Real sites shipped by developers using Velocity. From luxury real estate
            to digital agencies — all built on the same starter kit.
          </p>
        </motion.header>

        {/* Bento grid */}
        <div className="showcase-grid">
          {SHOWCASE_ITEMS.map((item, i) => (
            <ShowcaseCard
              key={item.slug}
              item={item}
              index={i}
              featured={i === 0}
              reducedMotion={reducedMotion}
              inView={inView}
            />
          ))}
        </div>

        {/* Community submission CTA */}
        <SubmitCTA reducedMotion={reducedMotion} inView={inView} />
      </div>
    </section>
  );
}
