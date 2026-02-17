import { useRef, useCallback } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Image import — Vite returns a URL string for static assets
// ---------------------------------------------------------------------------
import kirschImg from '../../assets/showcase/velocity-kirsch.jpg';

// ---------------------------------------------------------------------------
// Spring configs (shared with BentoGrid)
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
  name: string;
  category: string;
  description: string;
  image?: string;
  gradient?: string;
  accent: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    name: 'Paris VII',
    category: 'Luxury Real Estate',
    description:
      'Allen Kirsch — Haussmannian apartment showcase with editorial typography and immersive scroll-driven gallery',
    image: typeof kirschImg === 'string' ? kirschImg : (kirschImg as { src?: string }).src ?? '',
    accent: '#c4a265',
  },
  {
    name: 'Acme SaaS',
    category: 'B2B Platform',
    description:
      'Dashboard analytics with real-time data visualization and team collaboration tools',
    gradient:
      'radial-gradient(ellipse at 25% 50%, rgba(249,76,16,0.22) 0%, oklch(7% 0 0) 65%)',
    accent: 'var(--color-brand-500)',
  },
  {
    name: 'Studio Nova',
    category: 'Creative Agency',
    description:
      'Portfolio and case studies with scroll-driven animations and dynamic page transitions',
    gradient:
      'radial-gradient(ellipse at 75% 30%, rgba(129,140,248,0.25) 0%, oklch(7% 0 0) 65%)',
    accent: '#818cf8',
  },
  {
    name: 'CloudDash',
    category: 'Developer Tools',
    description:
      'Infrastructure monitoring with real-time metrics, alerting, and intelligent anomaly detection',
    gradient:
      'radial-gradient(ellipse at 50% 70%, rgba(52,211,153,0.22) 0%, oklch(7% 0 0) 65%)',
    accent: '#34d399',
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
    if (!disabled) scale.set(1.012);
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
// FeaturedCard — Large hero showcase
// ---------------------------------------------------------------------------
function FeaturedCard({
  item,
  reducedMotion,
  inView,
}: {
  item: ShowcaseItem;
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.15 }}
    >
      <TiltCard
        className="group relative overflow-hidden rounded-xl"
        strength={4}
        disabled={reducedMotion}
      >
        <a href="#" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-background">
            <img
              src={item.image}
              alt={`${item.name} — ${item.description}`}
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />

            {/* Overlay gradients — rgba black is standard for image darkening */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 60%)',
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.accent }}
                />
                <span className="text-xs font-mono uppercase tracking-widest text-foreground-muted">
                  {item.category}
                </span>
                <span className="hidden sm:inline text-xs font-mono text-foreground-subtle">
                  / Featured
                </span>
              </div>

              <h3
                className="font-display font-bold text-foreground tracking-tight leading-none"
                style={{ fontSize: 'var(--text-4xl)' }}
              >
                {item.name}
              </h3>

              <p className="mt-3 max-w-lg text-sm md:text-base text-foreground-muted leading-relaxed">
                {item.description}
              </p>

              {/* Hover link */}
              <div className="mt-6 inline-flex items-center gap-2 text-foreground-subtle group-hover:text-foreground-muted transition-colors duration-300">
                <span className="text-xs font-mono uppercase tracking-wider">
                  Visit Site
                </span>
                <svg
                  className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-xl border border-border group-hover:border-border-strong transition-colors duration-300 pointer-events-none" />
        </a>
      </TiltCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ShowcaseCard — Secondary showcase cards
// ---------------------------------------------------------------------------
function ShowcaseCard({
  item,
  index,
  reducedMotion,
  inView,
}: {
  item: ShowcaseItem;
  index: number;
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      className="h-full"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.25 + index * 0.1 }}
    >
      <TiltCard
        className="group relative overflow-hidden rounded-xl h-full"
        strength={10}
        disabled={reducedMotion}
      >
        <a href="#" className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <div
            className="relative aspect-[4/3] overflow-hidden"
            style={{ background: item.gradient }}
          >
            {/* Faux wireframe UI elements */}
            <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
              <div className="absolute top-5 left-5 right-5 flex items-center gap-1.5">
                <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
                <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
                <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
                <div className="ml-3 h-[3px] flex-1 max-w-24 rounded-full bg-foreground/50" />
              </div>
              <div className="absolute top-16 left-5 space-y-2.5">
                <div className="h-[3px] w-28 rounded bg-foreground" />
                <div className="h-[3px] w-20 rounded bg-foreground/60" />
                <div className="h-[3px] w-24 rounded bg-foreground/40" />
              </div>
              <div className="absolute bottom-5 right-5 h-16 w-16 rounded-lg border border-foreground/30" />
            </div>

            {/* Bottom fade to section bg */}
            <div
              className="absolute inset-x-0 bottom-0 h-3/4"
              style={{
                background:
                  'linear-gradient(to top, oklch(7% 0 0) 0%, transparent 100%)',
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: item.accent }}
                />
                <span className="text-xs font-mono uppercase tracking-widest text-foreground-subtle">
                  {item.category}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
                {item.name}
              </h3>
              <p className="mt-1.5 text-xs text-foreground-subtle leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-xl border border-border group-hover:border-border-strong transition-colors duration-300 pointer-events-none" />
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
      {/* Separator */}
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

        {/* Brand ghost button — CSS-only hover, uses design system tokens */}
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

  const [featured, ...rest] = SHOWCASE_ITEMS;

  return (
    <section
      id="showcase"
      ref={ref}
      className="invert-section bg-noise relative overflow-hidden"
      style={{
        backgroundColor: 'oklch(7% 0 0)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
      }}
    >
      {/* Atmospheric glow — subtle brand accent at top */}
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
            to SaaS dashboards — all built on the same starter kit.
          </p>
        </motion.header>

        {/* Featured item */}
        <FeaturedCard
          item={featured}
          reducedMotion={reducedMotion}
          inView={inView}
        />

        {/* Secondary items grid */}
        <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {rest.map((item, i) => (
            <ShowcaseCard
              key={item.name}
              item={item}
              index={i}
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
