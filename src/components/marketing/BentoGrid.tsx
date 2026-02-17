import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Spring configs
// ---------------------------------------------------------------------------
const SPRINGS = {
  ENTRANCE: { stiffness: 80, damping: 14, mass: 0.8 },
  PARALLAX: { stiffness: 150, damping: 20, mass: 0.5 },
  MAGNETIC: { stiffness: 200, damping: 18, mass: 0.4 },
  COUNTER: { stiffness: 100, damping: 12, mass: 1.0 },
  MORPH: { stiffness: 120, damping: 16, mass: 0.6 },
} as const;

// ---------------------------------------------------------------------------
// Icon SVG paths (matching the Astro Icon component)
// ---------------------------------------------------------------------------
const ICON_PATHS: Record<string, { d: string; fill?: boolean }> = {
  palette: { d: 'M12 2a10 10 0 0 0 0 20c.6 0 1 .4 1 1v-2a2 2 0 0 1 2-2h2c.6 0 1-.4 1-1 0-2.5-2-4.5-4.5-4.5H12a7 7 0 1 1 0-14M5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  box: { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' },
  layout: { d: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM3 9h18M9 21V9' },
  layers: { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  zap: { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  shield: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  globe: { d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  code: { d: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  search: { d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  image: { d: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21' },
  gauge: { d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01' },
  check: { d: 'M20 6L9 17l-5-5' },
  'toggle-left': { d: 'M16 5H8a7 7 0 1 0 0 14h8a7 7 0 1 0 0-14zM8 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  sliders: { d: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' },
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const icon = ICON_PATHS[name];
  if (!icon) return null;
  const paths = icon.d.split('M').filter(Boolean);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={icon.fill ? 'currentColor' : 'none'}
      stroke={icon.fill ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={`M${d}`} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    setIsTouch(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isTouch;
}

function useMousePosition(containerRef: React.RefObject<HTMLElement | null>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    };
    el.addEventListener('pointermove', handler);
    return () => el.removeEventListener('pointermove', handler);
  }, [containerRef, x, y]);

  return { x, y };
}

function useRelativeMouse(
  cardRef: React.RefObject<HTMLElement | null>,
  gridMouse: { x: MotionValue<number>; y: MotionValue<number> },
) {
  const relX = useTransform(gridMouse.x, (gx) => {
    const el = cardRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const parent = el.closest('[data-bento-grid]');
    const parentRect = parent?.getBoundingClientRect() ?? rect;
    const localX = gx - (rect.left - parentRect.left);
    return localX / rect.width - 0.5;
  });

  const relY = useTransform(gridMouse.y, (gy) => {
    const el = cardRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const parent = el.closest('[data-bento-grid]');
    const parentRect = parent?.getBoundingClientRect() ?? rect;
    const localY = gy - (rect.top - parentRect.top);
    return localY / rect.height - 0.5;
  });

  return { relX, relY };
}

function useParallaxLayers(relX: MotionValue<number>, relY: MotionValue<number>) {
  const bgX = useSpring(useTransform(relX, (v) => v * 4), SPRINGS.PARALLAX);
  const bgY = useSpring(useTransform(relY, (v) => v * 4), SPRINGS.PARALLAX);
  const midX = useSpring(useTransform(relX, (v) => v * 8), SPRINGS.PARALLAX);
  const midY = useSpring(useTransform(relY, (v) => v * 8), SPRINGS.PARALLAX);
  const fgX = useSpring(useTransform(relX, (v) => v * 14), SPRINGS.PARALLAX);
  const fgY = useSpring(useTransform(relY, (v) => v * 14), SPRINGS.PARALLAX);
  return { bg: { x: bgX, y: bgY }, mid: { x: midX, y: midY }, fg: { x: fgX, y: fgY } };
}

function useMagneticHover(
  elementRef: React.RefObject<HTMLElement | null>,
  { strength = 0.3, radius = 60 } = {},
) {
  const x = useSpring(0, SPRINGS.MAGNETIC);
  const y = useSpring(0, SPRINGS.MAGNETIC);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const parent = el.closest('[data-bento-card]') as HTMLElement | null;
    if (!parent) return;

    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const leave = () => {
      x.set(0);
      y.set(0);
    };

    parent.addEventListener('pointermove', move);
    parent.addEventListener('pointerleave', leave);
    return () => {
      parent.removeEventListener('pointermove', move);
      parent.removeEventListener('pointerleave', leave);
    };
  }, [elementRef, strength, radius, x, y]);

  return { x, y };
}

// ---------------------------------------------------------------------------
// Spotlight Overlay
// ---------------------------------------------------------------------------
function SpotlightOverlay({
  relX,
  relY,
  cardRef,
}: {
  relX: MotionValue<number>;
  relY: MotionValue<number>;
  cardRef: React.RefObject<HTMLElement | null>;
}) {
  const spotX = useTransform(relX, (v) => {
    const el = cardRef.current;
    return el ? (v + 0.5) * el.offsetWidth : 0;
  });
  const spotY = useTransform(relY, (v) => {
    const el = cardRef.current;
    return el ? (v + 0.5) * el.offsetHeight : 0;
  });
  const bg = useTransform(
    [spotX, spotY] as MotionValue[],
    ([sx, sy]: number[]) =>
      `radial-gradient(200px circle at ${sx}px ${sy}px, rgba(249,76,16,0.06), transparent)`,
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ background: bg }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// ParallaxCard
// ---------------------------------------------------------------------------
function ParallaxCard({
  children,
  gridMouse,
  index,
  reducedMotion,
  isTouch,
  className = '',
}: {
  children: React.ReactNode;
  gridMouse: { x: MotionValue<number>; y: MotionValue<number> };
  index: number;
  reducedMotion: boolean;
  isTouch: boolean;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { relX, relY } = useRelativeMouse(cardRef, gridMouse);
  const layers = useParallaxLayers(relX, relY);
  const disableHoverEffects = reducedMotion || isTouch;

  return (
    <motion.div
      ref={cardRef}
      data-bento-card
      className={`glass-card relative overflow-hidden p-6 md:p-8 ${className}`}
      role="listitem"
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...SPRINGS.ENTRANCE,
            delay: index * 0.15,
          },
        },
      }}
    >
      {!disableHoverEffects && (
        <SpotlightOverlay relX={relX} relY={relY} cardRef={cardRef} />
      )}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={
          disableHoverEffects
            ? undefined
            : { x: layers.bg.x, y: layers.bg.y, willChange: 'transform' }
        }
        aria-hidden="true"
      />
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Card 1: Design Token System
// ---------------------------------------------------------------------------
const TOKEN_ROWS = [
  {
    label: 'Primitives',
    colors: ['bg-brand-500', 'bg-brand-400', 'bg-brand-300', 'bg-foreground-muted', 'bg-border'],
  },
  { label: 'Semantic', colors: ['bg-brand-500', 'bg-foreground-muted', 'bg-border'] },
  { label: 'Component', colors: ['bg-brand-400', 'bg-brand-300'] },
];

function DesignTokensCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <LucideIcon name="palette" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          3-Tier Design Token System
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Primitives, semantic tokens, and component tokens. Change your entire look by editing a
        single CSS file.
      </p>
      <div className="space-y-3">
        {TOKEN_ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-foreground-muted">{row.label}</span>
            <div className="flex gap-1.5">
              {row.colors.map((color, dotIndex) => {
                const globalIndex =
                  TOKEN_ROWS.slice(0, TOKEN_ROWS.indexOf(row)).reduce(
                    (acc, r) => acc + r.colors.length,
                    0,
                  ) + dotIndex;

                return (
                  <motion.div
                    key={`${row.label}-${dotIndex}`}
                    className={`h-4 w-4 rounded-full ${color}`}
                    animate={
                      !reducedMotion && isHovered
                        ? {
                            scale: [1, 1.3, 1],
                            filter: [
                              'hue-rotate(0deg)',
                              'hue-rotate(20deg)',
                              'hue-rotate(0deg)',
                            ],
                          }
                        : { scale: 1, filter: 'hue-rotate(0deg)' }
                    }
                    transition={
                      !reducedMotion
                        ? { ...SPRINGS.MORPH, delay: globalIndex * 0.04 }
                        : { duration: 0 }
                    }
                    whileHover={
                      !reducedMotion
                        ? {
                            scale: 1.5,
                            boxShadow: '0 0 12px rgba(249,76,16,0.4)',
                            filter: 'hue-rotate(30deg)',
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 2: 57+ Components — split layout, grayscale icons, ripple hover
// ---------------------------------------------------------------------------
const COMPONENTS = [
  { icon: 'box', label: 'Buttons' },
  { icon: 'layout', label: 'Cards' },
  { icon: 'layers', label: 'Forms' },
  { icon: 'zap', label: 'Data' },
  { icon: 'shield', label: 'Auth' },
  { icon: 'globe', label: 'i18n' },
  { icon: 'code', label: 'Code' },
  { icon: 'search', label: 'Search' },
  { icon: 'image', label: 'Media' },
];

function ComponentIcon({
  icon,
  label,
  index,
  hoveredIndex,
  reducedMotion,
}: {
  icon: string;
  label: string;
  index: number;
  hoveredIndex: number | null;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Calculate ripple distance from hovered icon
  const hoveredRow = hoveredIndex !== null ? Math.floor(hoveredIndex / 3) : -1;
  const hoveredCol = hoveredIndex !== null ? hoveredIndex % 3 : -1;
  const row = Math.floor(index / 3);
  const col = index % 3;
  const dist =
    hoveredIndex !== null
      ? Math.sqrt((row - hoveredRow) ** 2 + (col - hoveredCol) ** 2)
      : 0;
  const isActive = hoveredIndex !== null;
  const rippleScale = isActive ? Math.max(1, 1.15 - dist * 0.05) : 1;
  const rippleDelay = dist * 0.06;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-1.5"
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 8 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { ...SPRINGS.ENTRANCE, delay: index * 0.05 },
        },
      }}
    >
      <motion.div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background-secondary text-foreground-muted"
        animate={
          !reducedMotion
            ? {
                scale: rippleScale,
                borderColor: isActive && dist < 1.5
                  ? 'var(--color-brand-500)'
                  : 'var(--color-border)',
              }
            : undefined
        }
        transition={
          !reducedMotion
            ? { ...SPRINGS.MAGNETIC, delay: rippleDelay }
            : { duration: 0 }
        }
        whileHover={
          !reducedMotion
            ? {
                scale: 1.2,
                borderColor: 'var(--color-brand-500)',
                boxShadow: '0 0 16px rgba(249,76,16,0.15)',
              }
            : undefined
        }
      >
        <LucideIcon name={icon} className="h-4 w-4 shrink-0" />
      </motion.div>
      <span className="text-[10px] font-medium text-foreground-subtle">{label}</span>
    </motion.div>
  );
}

function ComponentsCard({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <LucideIcon name="box" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          57+ Production Components
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Buttons, cards, forms, navigation, data display, feedback, overlays — all zero-JS by
        default.
      </p>
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {COMPONENTS.map((comp, i) => (
          <div
            key={comp.icon}
            onPointerEnter={() => setHoveredIndex(i)}
            onPointerLeave={() => setHoveredIndex(null)}
          >
            <ComponentIcon
              icon={comp.icon}
              label={comp.label}
              index={i}
              hoveredIndex={hoveredIndex}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 3: Speed Waterfall — oversized bg patterns, dramatic bars
// ---------------------------------------------------------------------------
const PERF_METRICS = [
  { label: 'FCP', value: '0.4s', percent: 13 },
  { label: 'LCP', value: '0.8s', percent: 27 },
  { label: 'TTI', value: '0.5s', percent: 17 },
  { label: 'CLS', value: '0.00', percent: 2 },
];

function WaterfallBar({
  label,
  value,
  percent,
  index,
  reducedMotion,
}: {
  label: string;
  value: string;
  percent: number;
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-mono font-semibold text-foreground-muted">
          {label}
        </span>
        <motion.span
          className="text-xs font-mono font-bold text-emerald-500"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={isInView || reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="relative h-7 w-full overflow-hidden rounded-md bg-foreground/[0.05]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={reducedMotion ? { width: `${percent}%` } : { width: 0 }}
          animate={
            isInView || reducedMotion
              ? { width: `${percent}%` }
              : { width: 0 }
          }
          transition={{
            ...SPRINGS.ENTRANCE,
            delay: index * 0.15,
          }}
        />
      </div>
    </div>
  );
}

function SpeedCard({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <LucideIcon name="zap" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">Built for Speed</h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Sub-second loads on every metric. Zero JavaScript by default means your pages fly.
      </p>

      <div className="space-y-4">
        {PERF_METRICS.map((metric, i) => (
          <WaterfallBar
            key={metric.label}
            label={metric.label}
            value={metric.value}
            percent={metric.percent}
            index={i}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 4: SEO & OG Images — realistic social unfurl + checklist
// ---------------------------------------------------------------------------
const SEO_FEATURES = [
  { label: 'Meta Tags', icon: 'code' },
  { label: 'JSON-LD', icon: 'layers' },
  { label: 'Sitemap', icon: 'globe' },
  { label: 'RSS Feed', icon: 'layout' },
  { label: 'OG Images', icon: 'image' },
  { label: 'Canonical URLs', icon: 'shield' },
];

function SeoOgCard({ reducedMotion }: { reducedMotion: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <div ref={cardRef}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <LucideIcon name="search" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          SEO & Dynamic OG Images
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Automatic meta tags, JSON-LD structured data, sitemap, RSS, and dynamic Open Graph image
        generation.
      </p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Social unfurl preview */}
        <div className="flex-1 overflow-hidden rounded-lg border border-border bg-background-secondary">
          {/* OG image banner */}
          <div className="relative h-24 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-brand-300/5"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={isInView || reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                initial={reducedMotion ? { width: 64 } : { width: 0 }}
                animate={isInView || reducedMotion ? { width: 64 } : { width: 0 }}
                transition={SPRINGS.ENTRANCE}
              />
            </div>
          </div>
          {/* Card content */}
          <div className="space-y-1.5 p-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-brand-500/30" />
              <span className="text-[10px] text-foreground-subtle font-mono">velocity.dev</span>
            </div>
            <p className="text-xs font-semibold text-foreground font-display leading-tight">
              Velocity — Ship faster with Astro 6
            </p>
            <p className="text-[10px] text-foreground-muted leading-snug">
              The production-ready Astro starter with 57+ components, design tokens, and perfect Lighthouse scores.
            </p>
          </div>
        </div>

        {/* SEO feature tiles */}
        <div className="grid flex-1 grid-cols-2 gap-2">
          {SEO_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.label}
              className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background-secondary/70 px-3 py-2.5"
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              animate={
                isInView || reducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 6 }
              }
              transition={{ ...SPRINGS.ENTRANCE, delay: 0.15 + i * 0.06 }}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
                <LucideIcon name={feature.icon} className="h-3 w-3 shrink-0" />
              </div>
              <span className="text-xs font-medium text-foreground-muted">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BentoGrid — main exported component
// ---------------------------------------------------------------------------
export default function BentoGrid() {
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced ?? false;
  const isTouch = useIsTouchDevice();
  const gridRef = useRef<HTMLDivElement>(null);
  const gridMouse = useMousePosition(gridRef);
  const isInView = useInView(gridRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
      <div className="container">
        <header className="mx-auto max-w-2xl text-center" style={{ marginBottom: 'var(--space-section-header)' }}>
          <h2
            id="features-heading"
            className="font-display font-bold tracking-tight text-foreground"
            style={{ fontSize: 'var(--text-4xl)' }}
          >
            Everything you need to ship
          </h2>
          <p className="mt-4 text-lg text-foreground-muted">
            Built on Astro 6 with a complete design system, 57+ components, and production-ready
            defaults.
          </p>
        </header>

        <motion.div
          ref={gridRef}
          data-bento-grid
          className="bento-grid"
          role="list"
          aria-labelledby="features-heading"
          style={{ opacity: reducedMotion ? 1 : undefined }}
          initial={reducedMotion ? 'visible' : 'hidden'}
          animate={isInView || reducedMotion ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {/* Card 1: Design Token System (2-col span) */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={0}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <DesignTokensCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 2: 57+ Components */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={1}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <ComponentsCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 3: Speed Waterfall */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={2}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <SpeedCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 4: SEO & OG Images (2-col span) */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={3}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <SeoOgCard reducedMotion={reducedMotion} />
          </ParallaxCard>
        </motion.div>
      </div>
    </section>
  );
}
