import { useState } from 'react';

// ---------------------------------------------------------------------------
// All component names from the registry
// ---------------------------------------------------------------------------
const COMPONENT_NAMES = [
  'Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch',
  'Card', 'Badge', 'Avatar', 'AvatarGroup', 'Table', 'Pagination', 'Progress', 'Skeleton',
  'Alert', 'Toast', 'Tooltip',
  'Dialog', 'Dropdown', 'Tabs', 'VerticalTabs', 'Accordion',
  'Separator',
  'Icon',
  'CodeBlock',
  'Logo', 'CTA', 'NpmCopyButton', 'SocialProof', 'TerminalDemo',
  'ContactForm', 'NewsletterForm', 'FormField', 'SearchInput', 'PasswordInput', 'StatCard', 'EmptyState',
  'Hero', 'Header', 'Footer',
];

// Split into two roughly equal rows
const ROW_1 = COMPONENT_NAMES.slice(0, Math.ceil(COMPONENT_NAMES.length / 2));
const ROW_2 = COMPONENT_NAMES.slice(Math.ceil(COMPONENT_NAMES.length / 2));

function Pill({ name, isHovered, onHover, onLeave }: {
  name: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 font-mono text-sm transition-all duration-200 cursor-default select-none ${
        isHovered
          ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] shadow-[0_0_20px_rgba(249,76,16,0.15)]'
          : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground-muted)]'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {name}
    </span>
  );
}

function MarqueeRow({ names, reverse }: { names: string[]; reverse?: boolean }) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // Duplicate for seamless loop
  const doubled = [...names, ...names];

  return (
    <div className="overflow-hidden marquee-container">
      <div className={`marquee-row ${reverse ? 'marquee-row-reverse' : ''}`}>
        {doubled.map((name, i) => (
          <Pill
            key={`${name}-${i}`}
            name={name}
            isHovered={hoveredName === name}
            onHover={() => setHoveredName(name)}
            onLeave={() => setHoveredName(null)}
          />
        ))}
      </div>
    </div>
  );
}

export default function ComponentWall() {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 'var(--space-section-sm)', paddingBottom: 'var(--space-section-sm)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <span
            className="font-mono text-sm font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-brand-500)' }}
          >
            The Full Library
          </span>
          <h2
            className="font-display font-bold tracking-tight mt-4"
            style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-foreground)' }}
          >
            Every. Single. One.
          </h2>
        </div>

        <div className="space-y-3">
          <MarqueeRow names={ROW_1} />
          <MarqueeRow names={ROW_2} reverse />
        </div>
      </div>
    </section>
  );
}
