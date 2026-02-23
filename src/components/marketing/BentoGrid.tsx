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
// Marketing icon system — multi-element SVG components
// ---------------------------------------------------------------------------

/** Shared SVG wrapper props for all marketing icons */
const MKT_SVG_PROPS = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/**
 * mkt-tokens — Design Token System
 * Three cascading swatch chips stepping diagonally up-right,
 * each with a small filled dot representing a token value.
 */
const IconTokens = () => (
  <>
    <rect x="2" y="15" width="14" height="5" rx="2" />
    <rect x="6" y="10" width="14" height="5" rx="2" />
    <rect x="10" y="5" width="12" height="5" rx="2" />
    <circle cx="5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="13" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
  </>
);

/**
 * mkt-globe — Built-in i18n
 * Globe with elliptical meridian, equator, latitude bands, and a
 * dashed routing arc connecting two location dots (locale routing).
 */
const IconGlobe = () => (
  <>
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.5" y1="7" x2="19.5" y2="7" />
    <line x1="4.5" y1="17" x2="19.5" y2="17" />
    <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 7.5 Q12 10 15.2 15.5" fill="none" strokeDasharray="2.5 2" />
  </>
);

/**
 * mkt-shield — Consent & GDPR
 * Shield with an embedded padlock — protection and trusted consent.
 */
const IconShield = () => (
  <>
    <path d="M12 2.5l8 3v5.5c0 5-3.6 9.7-8 11-4.4-1.3-8-6-8-11V5.5l8-3z" fill="none" />
    <rect x="9.5" y="12" width="5" height="4.5" rx="1" fill="none" />
    <path d="M10.5 12v-1.5a1.5 1.5 0 0 1 3 0V12" fill="none" />
    <circle cx="12" cy="14.2" r="0.8" fill="currentColor" stroke="none" />
  </>
);

/**
 * mkt-content — Content & Search
 * A document inside a magnifying glass lens, with ruled content lines.
 * Merges content management and static search into one mark.
 */
const IconContent = () => (
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="17" y1="17" x2="22" y2="22" />
    <path d="M8 7.5h4l1.5 1.5v7H8V7.5z" fill="none" />
    <path d="M12 7.5v1.5h1.5" fill="none" />
    <line x1="9.5" y1="11" x2="12" y2="11" />
    <line x1="9.5" y1="13" x2="12" y2="13" />
    <line x1="9.5" y1="15" x2="11" y2="15" />
  </>
);

/**
 * mkt-components — 57+ Production Components
 * A 2×2 grid of rounded module tiles with a central plus connector
 * and accent dots — conveys a rich modular component library.
 */
const IconComponents = () => (
  <>
    <rect x="2" y="2" width="8.5" height="8.5" rx="1.5" />
    <rect x="13.5" y="2" width="8.5" height="8.5" rx="1.5" />
    <rect x="2" y="13.5" width="8.5" height="8.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="8.5" height="8.5" rx="1.5" />
    <line x1="10.5" y1="12" x2="13.5" y2="12" />
    <line x1="12" y1="10.5" x2="12" y2="13.5" />
    <circle cx="6.25" cy="6.25" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.75" cy="17.75" r="1.5" fill="currentColor" stroke="none" />
  </>
);

/**
 * mkt-speed — Built for Speed / Performance
 * Speedometer arc with three tick marks, a needle pinned at maximum,
 * a center pivot dot, and a small lightning bolt accent.
 */
const IconSpeed = () => (
  <>
    <path d="M4.5 18.5a10 10 0 0 1 15 0" fill="none" />
    <line x1="4.5" y1="18.5" x2="6.5" y2="18.5" />
    <line x1="12" y1="8.5" x2="12" y2="10.5" />
    <line x1="19.5" y1="18.5" x2="17.5" y2="18.5" />
    <line x1="12" y1="18" x2="17.5" y2="11" />
    <circle cx="12" cy="18" r="1.8" fill="currentColor" stroke="none" />
    <path d="M18 5.5l-2 3h1.5L16 11" fill="none" strokeWidth={1.5} />
  </>
);

/**
 * mkt-seo — SEO & Dynamic OG Images
 * Magnifying glass with an upward-trending analytics line in the lens,
 * plus broadcast arcs at top-right for social/OG sharing.
 */
const IconSeo = () => (
  <>
    <circle cx="10.5" cy="10.5" r="7.5" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
    <path d="M5.5 13.5L8 10.5L11 12L14 7.5" fill="none" />
    <path d="M18 5a3 3 0 0 1 0 4" fill="none" />
    <path d="M19.5 3.5a5.5 5.5 0 0 1 0 7" fill="none" />
  </>
);

/**
 * mkt-code — Zero JavaScript
 * Terminal window with title bar, three window-control dots, a prompt
 * chevron, a cursor line, and a zero ellipse — zero JS shipped.
 */
const IconCode = () => (
  <>
    <rect x="2" y="3" width="20" height="18" rx="3" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <circle cx="6" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="14" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <path d="M6 13.5l3-1.5-3-1.5" fill="none" />
    <line x1="11" y1="12" x2="11" y2="15" />
    <ellipse cx="18" cy="15.5" rx="2.5" ry="3" fill="none" />
  </>
);

/** Utility icon for generic Lucide-style fallback paths still used in card bodies */
const UTIL_PATHS: Record<string, string> = {
  check: 'M20 6L9 17l-5-5',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  layout: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM3 9h18M9 21V9',
  image: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  // Component grid body icons
  box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
};

/** Map from marketing icon name to inner JSX render function */
const MKT_ICONS: Record<string, () => React.ReactElement> = {
  'mkt-tokens': IconTokens,
  'mkt-globe': IconGlobe,
  'mkt-shield': IconShield,
  'mkt-content': IconContent,
  'mkt-components': IconComponents,
  'mkt-speed': IconSpeed,
  'mkt-seo': IconSeo,
  'mkt-code': IconCode,
};

function MarketingIcon({ name, className }: { name: string; className?: string }) {
  const Inner = MKT_ICONS[name];
  if (!Inner) return null;
  return (
    <svg {...MKT_SVG_PROPS} className={className}>
      <Inner />
    </svg>
  );
}

/** Thin wrapper for utility/body icons that are still plain path strings */
function UtilIcon({ name, className }: { name: string; className?: string }) {
  const d = UTIL_PATHS[name];
  if (!d) return null;
  const paths = d.split('M').filter(Boolean);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((seg, i) => (
        <path key={i} d={`M${seg}`} />
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
          <MarketingIcon name="mkt-tokens" className="h-5 w-5 shrink-0" />
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
// Card 2: i18n — locale switcher with morphing text
// ---------------------------------------------------------------------------
const LOCALES = [
  { code: 'EN', label: 'English', greeting: 'Hello' },
  { code: 'FR', label: 'Français', greeting: 'Bonjour' },
  { code: 'ES', label: 'Español', greeting: 'Hola' },
  { code: 'DE', label: 'Deutsch', greeting: 'Hallo' },
  { code: 'JA', label: '日本語', greeting: 'こんにちは' },
];

function I18nCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (reducedMotion || !isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LOCALES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isHovered, reducedMotion]);

  const active = LOCALES[activeIndex];

  return (
    <div
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => { setIsHovered(false); setActiveIndex(0); }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <MarketingIcon name="mkt-globe" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Built-in i18n
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Locale-aware routing, content collections per language, and RTL support out of the box.
      </p>

      {/* Locale switcher demo */}
      <div className="space-y-3">
        {/* Active greeting display */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-background-secondary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-semibold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">
                /{active.code.toLowerCase()}
              </span>
              <motion.span
                key={active.greeting}
                className="font-display text-base font-semibold text-foreground"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRINGS.MORPH }}
              >
                {active.greeting}
              </motion.span>
            </div>
            <motion.span
              key={active.label}
              className="text-xs text-foreground-subtle"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {active.label}
            </motion.span>
          </div>
        </div>

        {/* Locale pills */}
        <div className="flex gap-1.5">
          {LOCALES.map((locale, i) => (
            <motion.button
              key={locale.code}
              className="flex-1 rounded-md border px-2 py-1.5 text-center text-xs font-mono font-medium transition-colors cursor-pointer"
              animate={
                !reducedMotion
                  ? {
                      borderColor: i === activeIndex
                        ? 'var(--color-brand-500)'
                        : 'var(--color-border)',
                      color: i === activeIndex
                        ? 'var(--color-brand-500)'
                        : 'var(--color-foreground-muted)',
                      backgroundColor: i === activeIndex
                        ? 'rgba(249,76,16,0.08)'
                        : 'transparent',
                    }
                  : undefined
              }
              transition={{ ...SPRINGS.MORPH }}
              onClick={() => setActiveIndex(i)}
            >
              {locale.code}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 3: Consent Banner / GDPR — mini banner with animated toggles
// ---------------------------------------------------------------------------
const CONSENT_CATEGORIES = [
  { label: 'Necessary', key: 'necessary', required: true, enabled: true },
  { label: 'Analytics', key: 'analytics', required: false, enabled: false },
  { label: 'Marketing', key: 'marketing', required: false, enabled: false },
];

function ConsentCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [toggles, setToggles] = useState(
    CONSENT_CATEGORIES.map((c) => c.enabled),
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  // On hover, sequentially enable toggles; on leave, reset
  useEffect(() => {
    if (reducedMotion) return;
    if (!isHovered) {
      setToggles(CONSENT_CATEGORIES.map((c) => c.enabled));
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    CONSENT_CATEGORIES.forEach((cat, i) => {
      if (!cat.required) {
        timers.push(
          setTimeout(() => {
            setToggles((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, 300 + i * 200),
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [isHovered, reducedMotion]);

  return (
    <div
      ref={cardRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <MarketingIcon name="mkt-shield" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Consent & GDPR
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Google Consent Mode v2, granular cookie categories, and a polished consent UI — zero config.
      </p>

      {/* Mini consent panel */}
      <div className="space-y-1">
        {CONSENT_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.key}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-background-secondary/70 px-3 py-2"
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            animate={
              isInView || reducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={{ ...SPRINGS.ENTRANCE, delay: 0.1 + i * 0.06 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground-muted">
                {cat.label}
              </span>
              {cat.required && (
                <span className="text-[9px] font-medium text-foreground-subtle bg-foreground/[0.06] px-1.5 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>

            {/* Toggle track */}
            <motion.div
              className="relative h-5 w-9 shrink-0 rounded-full cursor-pointer"
              animate={{
                backgroundColor: toggles[i]
                  ? 'var(--color-brand-500)'
                  : 'var(--color-foreground-subtle)',
                opacity: toggles[i] ? 1 : 0.3,
              }}
              transition={{ ...SPRINGS.MORPH }}
            >
              <motion.div
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                animate={{ left: toggles[i] ? 18 : 2 }}
                transition={{ ...SPRINGS.MAGNETIC }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* GCM badge */}
      <motion.div
        className="mt-3 flex items-center gap-2 text-[10px] text-foreground-subtle font-mono"
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView || reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <UtilIcon name="check" className="h-3 w-3 text-emerald-500 shrink-0" />
        <span>Google Consent Mode v2 compatible</span>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 4: Content & Search — schema visualization + search bar
// ---------------------------------------------------------------------------
const CONTENT_FEATURES = [
  { icon: 'file-text', label: 'MDX' },
  { icon: 'layers', label: 'Collections' },
  { icon: 'layout', label: 'RSS' },
  { icon: 'search', label: 'Pagefind' },
];

function ContentSearchCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [searchText, setSearchText] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  // Simulate typing in search on hover
  useEffect(() => {
    if (reducedMotion || !isHovered) {
      setSearchText('');
      return;
    }
    const query = 'getting started';
    let i = 0;
    const interval = setInterval(() => {
      if (i <= query.length) {
        setSearchText(query.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [isHovered, reducedMotion]);

  return (
    <div
      ref={cardRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <MarketingIcon name="mkt-content" className="h-5 w-5 shrink-0" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Content & Search
        </h3>
      </div>
      <p className="mb-6 text-sm text-foreground-muted">
        Type-safe content collections with Zod schemas, MDX support, RSS feeds, and Pagefind for
        lightning-fast static search.
      </p>

      {/* Mini search bar */}
      <div className="mb-3 overflow-hidden rounded-lg border border-border bg-background-secondary">
        <div className="flex items-center gap-2 px-3 py-2">
          <UtilIcon name="search" className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
          <span className="text-xs text-foreground-muted font-mono">
            {searchText}
            <motion.span
              className="inline-block w-px h-3.5 bg-brand-500 align-middle ml-px"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </span>
        </div>
        {/* Search results preview */}
        <motion.div
          className="border-t border-border/60 overflow-hidden"
          animate={{ height: searchText.length > 6 ? 'auto' : 0, opacity: searchText.length > 6 ? 1 : 0 }}
          transition={{ ...SPRINGS.MORPH }}
        >
          <div className="px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <UtilIcon name="file-text" className="h-3 w-3 shrink-0 text-brand-500" />
              <span className="text-[11px] text-foreground font-medium">Getting Started Guide</span>
            </div>
            <div className="flex items-center gap-2">
              <UtilIcon name="file-text" className="h-3 w-3 shrink-0 text-foreground-subtle" />
              <span className="text-[11px] text-foreground-muted">Getting Started with Themes</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-4 gap-1.5">
        {CONTENT_FEATURES.map((feature, i) => (
          <motion.div
            key={feature.label}
            className="flex flex-col items-center gap-1 rounded-md border border-border/60 bg-background-secondary/70 py-2"
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            animate={
              isInView || reducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={{ ...SPRINGS.ENTRANCE, delay: 0.15 + i * 0.06 }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
              <UtilIcon name={feature.icon} className="h-3 w-3 shrink-0" />
            </div>
            <span className="text-[10px] font-medium text-foreground-subtle">{feature.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 5: 57+ Components — split layout, grayscale icons, ripple hover
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
        <UtilIcon name={icon} className="h-4 w-4 shrink-0" />
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
          <MarketingIcon name="mkt-components" className="h-5 w-5 shrink-0" />
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
          <MarketingIcon name="mkt-speed" className="h-5 w-5 shrink-0" />
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
          <MarketingIcon name="mkt-seo" className="h-5 w-5 shrink-0" />
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
                <UtilIcon name={feature.icon} className="h-3 w-3 shrink-0" />
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

          {/* Card 2: i18n */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={1}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <I18nCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 3: Consent & GDPR */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={2}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <ConsentCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 4: Content & Search */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={3}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <ContentSearchCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 5: 57+ Components (wide) */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={4}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <ComponentsCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 6: Speed Waterfall */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={5}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          >
            <SpeedCard reducedMotion={reducedMotion} />
          </ParallaxCard>

          {/* Card 7: SEO & OG Images (wide) */}
          <ParallaxCard
            gridMouse={gridMouse}
            index={6}
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
