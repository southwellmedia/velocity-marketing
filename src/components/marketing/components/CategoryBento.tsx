import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Spring configs (matching BentoGrid)
// ---------------------------------------------------------------------------
const SPRINGS = {
  ENTRANCE: { stiffness: 80, damping: 14, mass: 0.8 },
} as const;

// ---------------------------------------------------------------------------
// Category data — 6 tiles with lightweight JSX component recreations
// ---------------------------------------------------------------------------
interface Category {
  title: string;
  count: number;
  description: string;
  content: () => React.ReactElement;
}

const CATEGORIES: Category[] = [
  {
    title: 'Form',
    count: 7,
    description: 'Button, Input, Select, Checkbox, Radio, Switch, Textarea',
    content: () => (
      <div className="space-y-3 mt-4">
        {/* Button variant pills */}
        <div className="flex flex-wrap gap-1.5">
          {['Primary', 'Secondary', 'Outline', 'Ghost'].map((v) => (
            <span
              key={v}
              className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-medium"
              style={{
                background: v === 'Primary' ? 'var(--color-foreground)' : 'transparent',
                color: v === 'Primary' ? 'var(--color-background)' : 'var(--color-foreground-muted)',
                border: v !== 'Primary' ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {v}
            </span>
          ))}
        </div>
        {/* Mini input */}
        <div
          className="rounded-md border px-2.5 py-1.5 text-[10px]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-muted)' }}
        >
          Enter your email...
        </div>
        {/* Switch */}
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-7 rounded-full relative"
            style={{ background: 'var(--color-brand-500)' }}
          >
            <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
          </div>
          <span className="text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>Notifications</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Data Display',
    count: 8,
    description: 'Card, Badge, Avatar, AvatarGroup, Table, Pagination, Progress, Skeleton',
    content: () => (
      <div className="space-y-3 mt-4">
        {/* Mini card with avatar + badge */}
        <div
          className="rounded-lg border p-2.5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
        >
          <div className="flex items-center gap-2">
            {/* Avatar group */}
            <div className="flex -space-x-1.5">
              {['#F94C10', '#3b82f6', '#22c55e'].map((bg, i) => (
                <div
                  key={i}
                  className="h-5 w-5 rounded-full border-2"
                  style={{ background: bg, borderColor: 'var(--color-card)' }}
                />
              ))}
            </div>
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
              style={{ background: 'var(--color-brand-500)', color: '#fff' }}
            >
              Active
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>Progress</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-foreground-muted)' }}>68%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: '68%', background: 'var(--color-brand-500)' }}
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Feedback',
    count: 3,
    description: 'Alert, Toast, Tooltip',
    content: () => (
      <div className="space-y-2 mt-4">
        {[
          { label: 'Changes saved', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
          { label: 'Check connection', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Error occurred', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
        ].map((alert) => (
          <div
            key={alert.label}
            className="rounded-md border px-2.5 py-1.5 text-[10px] flex items-center gap-1.5"
            style={{ background: alert.bg, borderColor: alert.border, color: alert.color }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {alert.color === '#22c55e' ? (
                <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
              ) : alert.color === '#f59e0b' ? (
                <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
              ) : (
                <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
              )}
            </svg>
            {alert.label}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Overlay',
    count: 5,
    description: 'Dialog, Dropdown, Tabs, VerticalTabs, Accordion',
    content: () => (
      <div className="mt-4">
        {/* Mini tabs */}
        <div className="flex gap-px rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          {['Account', 'Settings', 'Billing'].map((tab, i) => (
            <div
              key={tab}
              className="flex-1 px-2.5 py-1.5 text-[10px] text-center font-medium"
              style={{
                background: i === 0 ? 'var(--color-foreground)' : 'var(--color-card)',
                color: i === 0 ? 'var(--color-background)' : 'var(--color-foreground-muted)',
              }}
            >
              {tab}
            </div>
          ))}
        </div>
        {/* Tab content placeholder */}
        <div
          className="mt-2 rounded-lg border p-2.5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="space-y-1.5">
            <div className="h-1.5 w-3/4 rounded" style={{ background: 'var(--color-border)' }} />
            <div className="h-1.5 w-1/2 rounded" style={{ background: 'var(--color-border)' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Patterns',
    count: 7,
    description: 'ContactForm, NewsletterForm, FormField, SearchInput, PasswordInput, StatCard, EmptyState',
    content: () => (
      <div className="mt-4">
        {/* Miniature contact form wireframe */}
        <div
          className="rounded-lg border p-2.5 space-y-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
        >
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-5 rounded border" style={{ borderColor: 'var(--color-border)' }} />
            <div className="h-5 rounded border" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="h-5 w-full rounded border" style={{ borderColor: 'var(--color-border)' }} />
          <div className="h-10 w-full rounded border" style={{ borderColor: 'var(--color-border)' }} />
          <div
            className="h-5 w-full rounded text-[9px] flex items-center justify-center font-medium"
            style={{ background: 'var(--color-foreground)', color: 'var(--color-background)' }}
          >
            Send Message
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Content & Marketing',
    count: 7,
    description: 'CodeBlock, Logo, CTA, NpmCopyButton, SocialProof, TerminalDemo, Hero',
    content: () => (
      <div className="space-y-3 mt-4">
        {/* Mini code block */}
        <div
          className="rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="px-2.5 py-1 text-[9px] border-b font-mono"
            style={{ background: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-foreground-muted)' }}
          >
            terminal
          </div>
          <div
            className="px-2.5 py-2 font-mono text-[10px]"
            style={{ background: 'var(--color-card)' }}
          >
            <span style={{ color: 'var(--color-foreground-muted)' }}>$ </span>
            <span style={{ color: 'var(--color-brand-500)' }}>npx</span>
            <span style={{ color: 'var(--color-foreground)' }}> create-velocity</span>
          </div>
        </div>
        {/* npm copy button mockup */}
        <div
          className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
        >
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>
            npm i create-velocity
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-foreground-subtle)' }}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// SpotlightOverlay (simplified from BentoGrid)
// ---------------------------------------------------------------------------
function SpotlightOverlay({
  cardRef,
  gridMouse,
}: {
  cardRef: React.RefObject<HTMLElement | null>;
  gridMouse: { x: MotionValue<number>; y: MotionValue<number> };
}) {
  const spotX = useTransform(gridMouse.x, (gx) => {
    const el = cardRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const parent = el.closest('[data-category-grid]');
    const parentRect = parent?.getBoundingClientRect() ?? rect;
    return gx - (rect.left - parentRect.left);
  });

  const spotY = useTransform(gridMouse.y, (gy) => {
    const el = cardRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const parent = el.closest('[data-category-grid]');
    const parentRect = parent?.getBoundingClientRect() ?? rect;
    return gy - (rect.top - parentRect.top);
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
// Category Card
// ---------------------------------------------------------------------------
function CategoryCard({
  category,
  index,
  gridMouse,
  reducedMotion,
}: {
  category: Category;
  index: number;
  gridMouse: { x: MotionValue<number>; y: MotionValue<number> };
  reducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      className="glass-card relative overflow-hidden p-5 md:p-6"
      role="listitem"
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...SPRINGS.ENTRANCE,
            delay: index * 0.1,
          },
        },
      }}
    >
      {!reducedMotion && (
        <SpotlightOverlay cardRef={cardRef} gridMouse={gridMouse} />
      )}

      <div className="relative z-[2]">
        <div className="flex items-center justify-between">
          <h3
            className="font-display font-bold"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--color-foreground)' }}
          >
            {category.title}
          </h3>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-medium"
            style={{
              background: 'var(--color-brand-500)',
              color: '#fff',
            }}
          >
            {category.count}
          </span>
        </div>

        <p
          className="text-xs mt-1 line-clamp-2"
          style={{ color: 'var(--color-foreground-muted)' }}
        >
          {category.description}
        </p>

        <category.content />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// CategoryBento — main export
// ---------------------------------------------------------------------------
export default function CategoryBento() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-50px' });
  const reducedMotion = useReducedMotion() ?? false;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handler = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    el.addEventListener('pointermove', handler);
    return () => el.removeEventListener('pointermove', handler);
  }, [mouseX, mouseY]);

  return (
    <section
      id="categories"
      className="relative overflow-hidden"
      style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
    >
      <div className="container">
        <div className="text-center mb-12">
          <span
            className="font-mono text-sm font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-brand-500)' }}
          >
            Component Categories
          </span>
          <h2
            className="font-display font-bold tracking-tight mt-4"
            style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-foreground)' }}
          >
            Everything You Need
          </h2>
          <p
            className="mt-3 mx-auto max-w-xl"
            style={{ fontSize: 'var(--text-base)', color: 'var(--color-foreground-muted)' }}
          >
            From form primitives to full patterns — organized by function, themed by tokens.
          </p>
        </div>

        <motion.div
          ref={gridRef}
          data-category-grid
          className="category-bento-grid"
          role="list"
          aria-label="Component categories"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.title}
              category={cat}
              index={i}
              gridMouse={{ x: mouseX, y: mouseY }}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
