import { useRef, useCallback, type CSSProperties } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Coming Soon flag — set to false when templates launch
// ---------------------------------------------------------------------------
const COMING_SOON = true;

// ---------------------------------------------------------------------------
// Spring configs (shared across marketing sections)
// ---------------------------------------------------------------------------
const SPRINGS = {
  ENTRANCE: { stiffness: 80, damping: 14, mass: 0.8 },
  TILT: { stiffness: 200, damping: 24, mass: 0.5 },
  SCALE: { stiffness: 300, damping: 30, mass: 0.3 },
} as const;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
interface Template {
  name: string;
  category: string;
  accent: string;
  gradient: string;
  wireframe: 'dashboard' | 'portfolio' | 'blog' | 'ecommerce' | 'docs';
}

const TEMPLATES: Template[] = [
  {
    name: 'Medical Practice',
    category: 'Healthcare & Wellness',
    accent: 'var(--color-brand-500)',
    gradient:
      'radial-gradient(ellipse at 30% 40%, rgba(249,76,16,0.18) 0%, var(--color-background-secondary) 70%)',
    wireframe: 'dashboard',
  },
  {
    name: 'Agency Portfolio',
    category: 'Creative & Studio',
    accent: '#818cf8',
    gradient:
      'radial-gradient(ellipse at 70% 30%, rgba(129,140,248,0.2) 0%, var(--color-background-secondary) 70%)',
    wireframe: 'portfolio',
  },
  {
    name: 'Developer Blog',
    category: 'Content & MDX',
    accent: '#34d399',
    gradient:
      'radial-gradient(ellipse at 40% 70%, rgba(52,211,153,0.18) 0%, var(--color-background-secondary) 70%)',
    wireframe: 'blog',
  },
  {
    name: 'E-Commerce',
    category: 'Storefront & Catalog',
    accent: '#f59e0b',
    gradient:
      'radial-gradient(ellipse at 60% 50%, rgba(245,158,11,0.16) 0%, var(--color-background-secondary) 70%)',
    wireframe: 'ecommerce',
  },
];

const FEATURES = [
  'All current templates',
  'Every future template',
  'Lifetime updates',
  'Full source code',
  'Priority support',
  'Commercial license',
];

// ---------------------------------------------------------------------------
// TiltCard — 3D perspective hover (reused pattern)
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
// Wireframe SVG illustrations per template type
// ---------------------------------------------------------------------------
function WireframeDashboard() {
  return (
    <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {/* Sidebar */}
      <div className="absolute top-0 left-0 bottom-0 w-1/4 border-r border-foreground/30">
        <div className="p-3 space-y-2">
          <div className="h-2 w-8 rounded bg-foreground" />
          <div className="mt-4 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-foreground/60" />
            <div className="h-1.5 w-3/4 rounded bg-foreground/40" />
            <div className="h-1.5 w-5/6 rounded bg-foreground/40" />
            <div className="h-1.5 w-2/3 rounded bg-foreground/40" />
          </div>
        </div>
      </div>
      {/* Main content: metric cards */}
      <div className="absolute top-3 left-[28%] right-3 flex gap-2">
        <div className="flex-1 h-8 rounded border border-foreground/30" />
        <div className="flex-1 h-8 rounded border border-foreground/30" />
        <div className="flex-1 h-8 rounded border border-foreground/30" />
      </div>
      {/* Chart area */}
      <div className="absolute top-14 left-[28%] right-3 bottom-3 rounded border border-foreground/30">
        <div className="absolute bottom-2 left-2 right-2 flex items-end gap-1.5 h-2/3">
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '45%' }} />
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '72%' }} />
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '58%' }} />
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '90%' }} />
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '35%' }} />
          <div className="flex-1 bg-foreground/40 rounded-t" style={{ height: '65%' }} />
        </div>
      </div>
    </div>
  );
}

function WireframePortfolio() {
  return (
    <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {/* Nav */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="h-2 w-10 rounded bg-foreground" />
        <div className="flex gap-2">
          <div className="h-1.5 w-6 rounded bg-foreground/50" />
          <div className="h-1.5 w-6 rounded bg-foreground/50" />
          <div className="h-1.5 w-6 rounded bg-foreground/50" />
        </div>
      </div>
      {/* Hero area */}
      <div className="absolute top-10 left-3 right-3 h-1/3 rounded border border-foreground/30" />
      {/* Gallery grid */}
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5" style={{ top: '52%' }}>
        <div className="rounded border border-foreground/30" />
        <div className="rounded border border-foreground/30" />
        <div className="rounded border border-foreground/30" />
      </div>
    </div>
  );
}

function WireframeBlog() {
  return (
    <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {/* Nav */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-3">
        <div className="h-2 w-8 rounded bg-foreground" />
        <div className="flex-1" />
        <div className="h-1.5 w-5 rounded bg-foreground/50" />
        <div className="h-1.5 w-5 rounded bg-foreground/50" />
      </div>
      {/* Article list */}
      <div className="absolute top-10 left-3 right-[30%] space-y-2">
        <div className="p-2 rounded border border-foreground/30">
          <div className="h-1.5 w-3/4 rounded bg-foreground/60" />
          <div className="mt-1.5 h-1 w-full rounded bg-foreground/30" />
          <div className="mt-0.5 h-1 w-2/3 rounded bg-foreground/30" />
        </div>
        <div className="p-2 rounded border border-foreground/30">
          <div className="h-1.5 w-1/2 rounded bg-foreground/60" />
          <div className="mt-1.5 h-1 w-full rounded bg-foreground/30" />
          <div className="mt-0.5 h-1 w-4/5 rounded bg-foreground/30" />
        </div>
        <div className="p-2 rounded border border-foreground/30">
          <div className="h-1.5 w-2/3 rounded bg-foreground/60" />
          <div className="mt-1.5 h-1 w-full rounded bg-foreground/30" />
        </div>
      </div>
      {/* Sidebar */}
      <div className="absolute top-10 right-3 w-[25%] space-y-2">
        <div className="h-1.5 w-full rounded bg-foreground/40" />
        <div className="h-1.5 w-3/4 rounded bg-foreground/30" />
        <div className="h-1.5 w-5/6 rounded bg-foreground/30" />
      </div>
    </div>
  );
}

function WireframeEcommerce() {
  return (
    <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {/* Nav with cart */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="h-2 w-10 rounded bg-foreground" />
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-5 rounded bg-foreground/50" />
          <div className="h-4 w-4 rounded border border-foreground/50" />
        </div>
      </div>
      {/* Product grid */}
      <div className="absolute top-10 left-3 right-3 bottom-3 grid grid-cols-2 gap-2">
        <div className="rounded border border-foreground/30 flex flex-col">
          <div className="flex-1 border-b border-foreground/20" />
          <div className="p-1.5 space-y-1">
            <div className="h-1 w-3/4 rounded bg-foreground/50" />
            <div className="h-1 w-1/2 rounded bg-foreground/30" />
          </div>
        </div>
        <div className="rounded border border-foreground/30 flex flex-col">
          <div className="flex-1 border-b border-foreground/20" />
          <div className="p-1.5 space-y-1">
            <div className="h-1 w-2/3 rounded bg-foreground/50" />
            <div className="h-1 w-1/3 rounded bg-foreground/30" />
          </div>
        </div>
        <div className="rounded border border-foreground/30 flex flex-col">
          <div className="flex-1 border-b border-foreground/20" />
          <div className="p-1.5 space-y-1">
            <div className="h-1 w-4/5 rounded bg-foreground/50" />
            <div className="h-1 w-2/5 rounded bg-foreground/30" />
          </div>
        </div>
        <div className="rounded border border-foreground/30 flex flex-col">
          <div className="flex-1 border-b border-foreground/20" />
          <div className="p-1.5 space-y-1">
            <div className="h-1 w-3/5 rounded bg-foreground/50" />
            <div className="h-1 w-1/4 rounded bg-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

const WIREFRAME_MAP: Record<Template['wireframe'], React.FC> = {
  dashboard: WireframeDashboard,
  portfolio: WireframePortfolio,
  blog: WireframeBlog,
  ecommerce: WireframeEcommerce,
  docs: WireframeBlog, // reuse blog layout for docs
};

// ---------------------------------------------------------------------------
// TemplateCard — Individual template preview
// ---------------------------------------------------------------------------
function TemplateCard({
  template,
  index,
  reducedMotion,
  inView,
}: {
  template: Template;
  index: number;
  reducedMotion: boolean;
  inView: boolean;
}) {
  const Wireframe = WIREFRAME_MAP[template.wireframe];

  return (
    <motion.div
      className="h-full"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.2 + index * 0.1 }}
    >
      <TiltCard
        className="group relative overflow-hidden rounded-xl h-full"
        strength={COMING_SOON ? 0 : 10}
        disabled={reducedMotion || COMING_SOON}
      >
        <div
          className="relative aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden"
          style={{ background: template.gradient }}
        >
          {/* Browser chrome dots */}
          <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 opacity-[0.15]" aria-hidden="true">
            <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
            <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
            <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
            <div className="ml-2 h-[3px] flex-1 max-w-20 rounded-full bg-foreground/50" />
          </div>

          {/* Wireframe illustration */}
          <div className="absolute inset-0" style={{ top: '14px' }}>
            <Wireframe />
          </div>

          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                'linear-gradient(to top, var(--color-background) 0%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: template.accent }}
              />
              <span className="text-xs font-mono uppercase tracking-widest text-foreground-subtle">
                {template.category}
              </span>
            </div>
            <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
              {template.name}
            </h3>
          </div>
        </div>

        {/* Border */}
        <div className="absolute inset-0 rounded-xl border border-border group-hover:border-border-strong transition-colors duration-300 pointer-events-none" />
      </TiltCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PricingCard — The $199 lifetime offer
// ---------------------------------------------------------------------------
function PricingCard({
  reducedMotion,
  inView,
}: {
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.15 }}
    >
      <TiltCard
        className="relative overflow-hidden rounded-xl"
        strength={COMING_SOON ? 0 : 4}
        disabled={reducedMotion || COMING_SOON}
      >
        <div className="relative rounded-xl border border-border bg-card p-6 md:p-8 lg:p-10">
          {/* Subtle brand glow behind the card */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(249,76,16,0.06) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />

          <div className="relative">
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-md border border-brand-500/20 bg-brand-500/5 px-3 py-1.5 mb-6">
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-500"
                aria-hidden="true"
              />
              <span className="text-xs font-mono uppercase tracking-widest text-brand-500">
                Lifetime Access
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span
                className="font-display font-bold text-foreground tracking-tight leading-none"
                style={{ fontSize: 'var(--text-5xl)' }}
              >
                $199
              </span>
              <span className="text-sm text-foreground-subtle">
                one-time
              </span>
            </div>

            <p className="mt-3 text-sm text-foreground-muted leading-relaxed max-w-sm">
              Unlimited access to every premium template — plus every new template we release, forever.
            </p>

            {/* Feature list */}
            <ul className="mt-6 space-y-3" role="list">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg
                    className="h-4 w-4 shrink-0 text-brand-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-foreground-muted">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {COMING_SOON ? (
              <>
                <div
                  className="mt-8 flex items-center justify-center gap-2 rounded-md h-12 px-6 text-sm font-medium border border-foreground/10 text-foreground-subtle cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <span className="font-mono uppercase tracking-wider text-xs">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-4 text-center text-xs text-foreground-subtle">
                  Join the waitlist to get notified at launch.
                </p>
              </>
            ) : (
              <>
                <a
                  href="#"
                  className="mt-8 flex items-center justify-center gap-2 rounded-md h-12 px-6 text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="font-mono uppercase tracking-wider text-xs">
                    Get All Templates
                  </span>
                  <svg
                    className="w-4 h-4"
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
                <p className="mt-4 text-center text-xs text-foreground-subtle">
                  30-day money-back guarantee
                </p>
              </>
            )}
          </div>
        </div>

        {/* Outer glow on hover */}
        <div className="absolute -inset-px rounded-xl border border-transparent group-hover:border-brand-500/20 transition-colors duration-300 pointer-events-none" />
      </TiltCard>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TemplatesTeaser — Main exported component
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ComingSoonOverlay — Cinematic stamp over disabled section
// ---------------------------------------------------------------------------
function ComingSoonOverlay({
  reducedMotion,
  inView,
}: {
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={inView || reducedMotion ? { opacity: 1 } : undefined}
      transition={{ ...SPRINGS.ENTRANCE, delay: 0.4 }}
      aria-hidden="true"
    >
      {/* Centered stamp container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute -inset-8 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(249,76,16,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Stamp */}
        <div
          className="relative px-10 py-5 border-2 border-foreground/15 rounded-sm"
          style={{
            transform: 'rotate(-6deg)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            background: 'rgba(0, 0, 0, 0.55)',
          }}
        >
          {/* Top rule */}
          <div
            className="absolute top-2 left-3 right-3 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--color-foreground)/0.15, transparent)',
            }}
          />

          <div className="text-center">
            <span
              className="block font-display font-bold uppercase tracking-[0.25em] text-foreground/70"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
            >
              Coming Soon
            </span>
            <span className="block mt-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/35">
              Premium templates in development
            </span>
          </div>

          {/* Bottom rule */}
          <div
            className="absolute bottom-2 left-3 right-3 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--color-foreground)/0.15, transparent)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TemplatesTeaser — Main exported component
// ---------------------------------------------------------------------------
export default function TemplatesTeaser() {
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Grayscale + fade styles when coming soon
  const comingSoonContentStyle: CSSProperties = COMING_SOON
    ? { filter: 'grayscale(1) brightness(0.7)', opacity: 0.45, pointerEvents: 'none' }
    : {};

  return (
    <section
      id="templates"
      ref={ref}
      className="relative overflow-hidden"
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
      }}
    >
      {/* Subtle atmospheric gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 30% 50%, rgba(249,76,16,0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Coming Soon overlay stamp */}
      {COMING_SOON && (
        <ComingSoonOverlay reducedMotion={reducedMotion} inView={inView} />
      )}

      <div className="container relative">
        {/* Section header — always visible, not grayscaled */}
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
              Templates
            </span>
          </div>

          <h2
            className="font-display font-bold tracking-tight text-foreground"
            style={{ fontSize: 'var(--text-4xl)' }}
          >
            Premium Templates
          </h2>
          <p className="mt-4 text-lg max-w-xl text-foreground-muted">
            Production-ready templates for every use case. One purchase, lifetime access to the entire collection.
          </p>
        </motion.header>

        {/* Two-column layout: templates grid + pricing card */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch"
          style={comingSoonContentStyle}
        >
          {/* Template previews — 3 columns on the left */}
          <div className="lg:col-span-3 grid grid-cols-2 grid-rows-2 gap-4 md:gap-5">
            {TEMPLATES.map((template, i) => (
              <TemplateCard
                key={template.name}
                template={template}
                index={i}
                reducedMotion={reducedMotion}
                inView={inView}
              />
            ))}
          </div>

          {/* Pricing card — 2 columns on the right */}
          <div className="lg:col-span-2 lg:sticky lg:top-8">
            <PricingCard reducedMotion={reducedMotion} inView={inView} />

            {/* Social proof / trust line */}
            <motion.div
              className="mt-6 flex items-center justify-center gap-4 text-foreground-subtle"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={inView || reducedMotion ? { opacity: 1 } : undefined}
              transition={{ ...SPRINGS.ENTRANCE, delay: 0.6 }}
            >
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span className="text-xs">Secure checkout</span>
              </div>
              <span className="text-foreground-subtle/30">|</span>
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                <span className="text-xs">Money-back guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
