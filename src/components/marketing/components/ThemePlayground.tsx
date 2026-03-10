import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Theme definitions — extracted from default.css, midnight.css, + new Ocean
// ---------------------------------------------------------------------------
interface ThemeTokens {
  name: string;
  label: string;
  description: string;
  tokens: Record<string, string>;
  codeLines: { prop: string; value: string }[];
}

const THEMES: ThemeTokens[] = [
  {
    name: 'default',
    label: 'Default',
    description: 'Clean neutrals with International Orange',
    tokens: {
      '--tp-bg': '#ffffff',
      '--tp-bg-secondary': '#f9fafb',
      '--tp-fg': '#111827',
      '--tp-fg-muted': '#6b7280',
      '--tp-border': '#e5e7eb',
      '--tp-card': '#ffffff',
      '--tp-primary': '#111827',
      '--tp-primary-fg': '#ffffff',
      '--tp-accent': '#F94C10',
      '--tp-accent-hover': '#e04410',
      '--tp-input-bg': '#ffffff',
      '--tp-input-border': '#d1d5db',
      '--tp-success': '#22c55e',
      '--tp-warning': '#f59e0b',
      '--tp-error': '#ef4444',
      '--tp-radius': '0.375rem',
    },
    codeLines: [
      { prop: '--background', value: 'var(--gray-0)' },
      { prop: '--foreground', value: 'var(--gray-900)' },
      { prop: '--border', value: 'var(--gray-200)' },
      { prop: '--primary', value: 'var(--gray-900)' },
      { prop: '--primary-foreground', value: 'var(--gray-0)' },
      { prop: '--accent', value: 'var(--brand-500)' },
      { prop: '--card', value: 'var(--gray-0)' },
      { prop: '--input-border', value: 'var(--gray-300)' },
      { prop: '--ring', value: 'var(--gray-900)' },
      { prop: '--radius-md', value: '0.375rem' },
    ],
  },
  {
    name: 'midnight',
    label: 'Midnight',
    description: 'Deep purple with electric violet',
    tokens: {
      '--tp-bg': '#1a1028',
      '--tp-bg-secondary': '#231536',
      '--tp-fg': '#ede9f6',
      '--tp-fg-muted': '#8b7fa8',
      '--tp-border': '#362654',
      '--tp-card': '#231536',
      '--tp-primary': '#ede9f6',
      '--tp-primary-fg': '#1a1028',
      '--tp-accent': '#a855f7',
      '--tp-accent-hover': '#9333ea',
      '--tp-input-bg': '#231536',
      '--tp-input-border': '#453266',
      '--tp-success': '#22c55e',
      '--tp-warning': '#f59e0b',
      '--tp-error': '#ef4444',
      '--tp-radius': '0.5rem',
    },
    codeLines: [
      { prop: '--background', value: 'oklch(10% 0.04 285)' },
      { prop: '--foreground', value: 'oklch(94% 0.012 285)' },
      { prop: '--border', value: 'oklch(20% 0.035 285)' },
      { prop: '--primary', value: 'oklch(94% 0.012 285)' },
      { prop: '--primary-foreground', value: 'oklch(10% 0.04 285)' },
      { prop: '--accent', value: 'var(--brand-400)' },
      { prop: '--card', value: 'oklch(14% 0.035 285)' },
      { prop: '--input-border', value: 'oklch(28% 0.03 285)' },
      { prop: '--ring', value: 'var(--brand-400)' },
      { prop: '--radius-md', value: '0.5rem' },
    ],
  },
  {
    name: 'ocean',
    label: 'Ocean',
    description: 'Cool blue-gray with teal accent',
    tokens: {
      '--tp-bg': '#0f1729',
      '--tp-bg-secondary': '#162033',
      '--tp-fg': '#e2e8f0',
      '--tp-fg-muted': '#7c8ca3',
      '--tp-border': '#1e3048',
      '--tp-card': '#162033',
      '--tp-primary': '#e2e8f0',
      '--tp-primary-fg': '#0f1729',
      '--tp-accent': '#14b8a6',
      '--tp-accent-hover': '#0d9488',
      '--tp-input-bg': '#162033',
      '--tp-input-border': '#2a4060',
      '--tp-success': '#22c55e',
      '--tp-warning': '#f59e0b',
      '--tp-error': '#ef4444',
      '--tp-radius': '0.625rem',
    },
    codeLines: [
      { prop: '--background', value: 'oklch(12% 0.03 240)' },
      { prop: '--foreground', value: 'oklch(92% 0.01 220)' },
      { prop: '--border', value: 'oklch(22% 0.04 240)' },
      { prop: '--primary', value: 'oklch(92% 0.01 220)' },
      { prop: '--primary-foreground', value: 'oklch(12% 0.03 240)' },
      { prop: '--accent', value: 'oklch(72% 0.14 180)' },
      { prop: '--card', value: 'oklch(16% 0.03 240)' },
      { prop: '--input-border', value: 'oklch(30% 0.04 240)' },
      { prop: '--ring', value: 'oklch(72% 0.14 180)' },
      { prop: '--radius-md', value: '0.625rem' },
    ],
  },
];

// ---------------------------------------------------------------------------
// CodePanel — IDE-style display of theme tokens
// ---------------------------------------------------------------------------
function CodePanel({ theme, prevTheme }: { theme: ThemeTokens; prevTheme: string | null }) {
  const changedProps = useRef(new Set<string>());

  useEffect(() => {
    if (prevTheme && prevTheme !== theme.name) {
      changedProps.current = new Set(theme.codeLines.map(l => l.prop));
      const timer = setTimeout(() => {
        changedProps.current = new Set();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [theme.name, prevTheme]);

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        background: 'var(--color-surface-invert)',
        borderColor: 'var(--color-border-invert)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center h-9 px-4 border-b"
        style={{
          background: 'var(--color-surface-invert-secondary)',
          borderColor: 'var(--color-border-invert)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-foreground-subtle)', opacity: 0.3 }} />
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-foreground-subtle)', opacity: 0.3 }} />
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-foreground-subtle)', opacity: 0.3 }} />
        </div>
        <span className="flex-1 text-center text-xs" style={{ color: 'var(--color-on-invert-muted)' }}>
          {theme.name}.css
        </span>
        <div className="w-12" />
      </div>

      {/* Code content */}
      <div className="p-4 font-mono text-[13px] leading-relaxed overflow-x-auto">
        <div style={{ color: 'var(--color-on-invert-muted)' }}>
          <span style={{ color: 'var(--color-brand-500)' }}>:root</span>{' '}
          <span style={{ color: 'var(--color-on-invert)' }}>{'{'}</span>
        </div>
        {theme.codeLines.map((line, i) => {
          const isHighlighted = changedProps.current.has(line.prop);
          return (
            <motion.div
              key={line.prop}
              className={`pl-4 ${isHighlighted ? 'code-highlight-line' : ''}`}
              initial={false}
              animate={{
                backgroundColor: isHighlighted ? 'rgba(249, 76, 16, 0.08)' : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.4 }}
            >
              <span style={{ color: 'var(--color-brand-400)', opacity: 0.4, userSelect: 'none', display: 'inline-block', width: '1.5rem', textAlign: 'right', marginRight: '1rem' }}>
                {i + 2}
              </span>
              <span style={{ color: 'var(--color-brand-500)' }}>{line.prop}</span>
              <span style={{ color: 'var(--color-on-invert-muted)' }}>: </span>
              <span style={{ color: 'var(--color-on-invert)' }}>{line.value}</span>
              <span style={{ color: 'var(--color-on-invert-muted)' }}>;</span>
            </motion.div>
          );
        })}
        <div style={{ color: 'var(--color-on-invert)' }}>{'}'}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini App Preview — live components styled via CSS custom properties
// ---------------------------------------------------------------------------
function MiniAppPreview({ theme }: { theme: ThemeTokens }) {
  const [switchOn, setSwitchOn] = useState(true);
  const [progress] = useState(72);
  const style = theme.tokens;

  return (
    <div
      className="theme-playground-preview rounded-xl border p-6 space-y-5"
      style={{
        background: style['--tp-bg'],
        borderColor: style['--tp-border'],
        borderRadius: style['--tp-radius'],
      }}
    >
      {/* Card with badge */}
      <div
        className="rounded-lg border p-4"
        style={{
          background: style['--tp-card'],
          borderColor: style['--tp-border'],
          borderRadius: style['--tp-radius'],
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm" style={{ color: style['--tp-fg'] }}>
            Dashboard
          </span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: style['--tp-accent'] + '18',
              color: style['--tp-accent'],
            }}
          >
            Pro
          </span>
        </div>
        <p className="text-xs" style={{ color: style['--tp-fg-muted'] }}>
          Your project is performing well.
        </p>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: style['--tp-fg'] }}>
          Email
        </label>
        <div
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{
            background: style['--tp-input-bg'],
            borderColor: style['--tp-input-border'],
            color: style['--tp-fg-muted'],
            borderRadius: style['--tp-radius'],
          }}
        >
          hello@velocity.build
        </div>
      </div>

      {/* Switch */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: style['--tp-fg'] }}>
          Enable notifications
        </span>
        <button
          onClick={() => setSwitchOn(!switchOn)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
          style={{
            background: switchOn ? style['--tp-accent'] : style['--tp-border'],
          }}
          type="button"
          role="switch"
          aria-checked={switchOn}
        >
          <span
            className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200"
            style={{
              transform: switchOn ? 'translateX(22px)' : 'translateX(4px)',
            }}
          />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: style['--tp-fg-muted'] }}>Storage</span>
          <span className="text-xs font-mono" style={{ color: style['--tp-fg-muted'] }}>{progress}%</span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: style['--tp-border'] }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: style['--tp-accent'] }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Alert */}
      <div
        className="rounded-md border px-3 py-2 text-xs flex items-center gap-2"
        style={{
          background: style['--tp-success'] + '10',
          borderColor: style['--tp-success'] + '30',
          color: style['--tp-success'],
          borderRadius: style['--tp-radius'],
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        All systems operational
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          style={{
            background: style['--tp-primary'],
            color: style['--tp-primary-fg'],
            borderRadius: style['--tp-radius'],
          }}
          type="button"
        >
          Save Changes
        </button>
        <button
          className="flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          style={{
            background: 'transparent',
            borderColor: style['--tp-border'],
            color: style['--tp-fg'],
            borderRadius: style['--tp-radius'],
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ThemePlayground — main export
// ---------------------------------------------------------------------------
export default function ThemePlayground() {
  const [activeTheme, setActiveTheme] = useState(0);
  const [prevThemeName, setPrevThemeName] = useState<string | null>(null);
  const theme = THEMES[activeTheme];

  function handleThemeChange(index: number) {
    setPrevThemeName(THEMES[activeTheme].name);
    setActiveTheme(index);
  }

  return (
    <section
      className="invert-section relative overflow-hidden"
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
      }}
    >
      <div className="bg-noise pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <span
              className="font-mono text-sm font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-brand-500)' }}
            >
              Design Tokens
            </span>
            <h2
              className="font-display font-bold tracking-tight mt-4"
              style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-on-invert)' }}
            >
              One Token File. Three Looks.
            </h2>
            <p
              className="mt-3 mx-auto max-w-xl"
              style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-invert-muted)' }}
            >
              Swap a single CSS file and every component transforms. No prop changes, no refactoring.
            </p>
          </div>

          {/* Theme selector pills */}
          <div className="flex justify-center gap-2 mb-8">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => handleThemeChange(i)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                  activeTheme === i
                    ? 'border-[var(--color-brand-500)] text-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10'
                    : 'border-[var(--color-border-invert)] text-[var(--color-on-invert-muted)] hover:text-[var(--color-on-invert)] hover:border-[var(--color-border-invert-strong)]'
                }`}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Live preview */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme.name}
                  initial={{ opacity: 0.8, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MiniAppPreview theme={theme} />
                </motion.div>
              </AnimatePresence>
              <p className="text-center mt-3 text-xs" style={{ color: 'var(--color-on-invert-muted)' }}>
                {theme.description}
              </p>
            </div>

            {/* Right: Code panel */}
            <div>
              <CodePanel theme={theme} prevTheme={prevThemeName} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
