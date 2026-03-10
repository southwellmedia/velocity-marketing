import { useState } from 'react';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// CVA variant/size options matching button.variants.ts
// ---------------------------------------------------------------------------
const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];

// Styles that match the actual CVA output
const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-foreground)',
    color: 'var(--color-background)',
  },
  secondary: {
    background: 'var(--color-secondary)',
    color: 'var(--color-secondary-foreground)',
    border: '1px solid var(--color-border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-foreground-secondary)',
  },
  destructive: {
    background: 'var(--color-destructive)',
    color: '#fff',
  },
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------
function getUsageCode(variant: Variant, size: Size, fullWidth: boolean, icon: boolean): string[] {
  const props: string[] = [];
  if (variant !== 'primary') props.push(`variant="${variant}"`);
  if (size !== 'md') props.push(`size="${size}"`);
  if (fullWidth) props.push('fullWidth');
  if (icon) props.push('icon');

  if (props.length === 0) {
    return [
      '<Button>',
      '  Click me',
      '</Button>',
    ];
  }

  return [
    `<Button ${props.join(' ')}>`,
    icon ? '  <Icon name="plus" />' : '  Click me',
    '</Button>',
  ];
}

function getCvaCode(variant: Variant, size: Size): { lines: string[]; highlightIndices: number[] } {
  const lines = [
    "const buttonVariants = cva(",
    "  ['inline-flex items-center justify-center',",
    "   'font-medium rounded-md',",
    "   'transition-all duration-150'],",
    "  {",
    "    variants: {",
    "      variant: {",
    `        primary: 'bg-foreground text-background...',`,
    `        secondary: 'bg-secondary border border-border...',`,
    `        outline: 'border bg-transparent...',`,
    `        ghost: 'text-foreground-secondary...',`,
    `        destructive: 'bg-destructive...',`,
    "      },",
    "      size: {",
    `        sm: 'h-8 px-3 text-xs',`,
    `        md: 'h-10 px-4 text-sm',`,
    `        lg: 'h-12 px-5 text-base',`,
    "      },",
    "    },",
    "    defaultVariants: {",
    "      variant: 'primary',",
    "      size: 'md',",
    "    },",
    "  }",
    ");",
  ];

  const variantLineMap: Record<Variant, number> = {
    primary: 7,
    secondary: 8,
    outline: 9,
    ghost: 10,
    destructive: 11,
  };

  const sizeLineMap: Record<Size, number> = {
    sm: 14,
    md: 15,
    lg: 16,
  };

  return {
    lines,
    highlightIndices: [variantLineMap[variant], sizeLineMap[size]],
  };
}

// ---------------------------------------------------------------------------
// VariantExplorer
// ---------------------------------------------------------------------------
export default function VariantExplorer() {
  const [variant, setVariant] = useState<Variant>('primary');
  const [size, setSize] = useState<Size>('md');
  const [fullWidth, setFullWidth] = useState(false);
  const [iconMode, setIconMode] = useState(false);

  const usageCode = getUsageCode(variant, size, fullWidth, iconMode);
  const { lines: cvaCode, highlightIndices } = getCvaCode(variant, size);

  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
    >
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <span
              className="font-mono text-sm font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-brand-500)' }}
            >
              Variant System
            </span>
            <h2
              className="font-display font-bold tracking-tight mt-4"
              style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-foreground)' }}
            >
              Built on CVA
            </h2>
            <p
              className="mt-3 mx-auto max-w-xl"
              style={{ fontSize: 'var(--text-base)', color: 'var(--color-foreground-muted)' }}
            >
              Type-safe variants with class-variance-authority. Every component follows the same pattern.
            </p>
          </div>

          {/* Split screen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Live preview + controls */}
            <div
              className="rounded-xl border p-6 md:p-8"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
            >
              {/* Live button preview */}
              <div className="flex items-center justify-center min-h-[120px] mb-8">
                <motion.button
                  layout
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${iconMode ? (size === 'sm' ? 'h-8 w-8 px-0' : size === 'lg' ? 'h-12 w-12 px-0' : 'h-10 w-10 px-0') : ''}`}
                  style={VARIANT_STYLES[variant]}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {iconMode ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ) : (
                    'Click me'
                  )}
                </motion.button>
              </div>

              {/* Controls */}
              <div className="space-y-5">
                {/* Variant */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-foreground-muted)' }}>
                    Variant
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIANTS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVariant(v)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all border ${
                          variant === v
                            ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]'
                            : 'border-[var(--color-border)] text-[var(--color-foreground-muted)] hover:border-[var(--color-border-strong)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-foreground-muted)' }}>
                    Size
                  </label>
                  <div className="flex gap-1.5">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all border ${
                          size === s
                            ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]'
                            : 'border-[var(--color-border)] text-[var(--color-foreground-muted)] hover:border-[var(--color-border-strong)]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fullWidth}
                      onChange={(e) => setFullWidth(e.target.checked)}
                      className="accent-[var(--color-brand-500)]"
                    />
                    <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>fullWidth</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={iconMode}
                      onChange={(e) => setIconMode(e.target.checked)}
                      className="accent-[var(--color-brand-500)]"
                    />
                    <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>icon</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Code panel */}
            <div className="space-y-4">
              {/* Usage code */}
              <div
                className="rounded-xl overflow-hidden border"
                style={{ background: 'var(--color-surface-invert)', borderColor: 'var(--color-border-invert)' }}
              >
                <div
                  className="flex items-center h-8 px-4 border-b text-[10px] font-medium uppercase tracking-wider"
                  style={{ background: 'var(--color-surface-invert-secondary)', borderColor: 'var(--color-border-invert)', color: 'var(--color-on-invert-muted)' }}
                >
                  Usage
                </div>
                <div className="p-4 font-mono text-[13px] leading-relaxed">
                  {usageCode.map((line, i) => (
                    <div key={i} style={{ color: 'var(--color-on-invert)' }}>
                      <span style={{ color: 'var(--color-on-invert-muted)', opacity: 0.4, userSelect: 'none', display: 'inline-block', width: '1.5rem', textAlign: 'right', marginRight: '1rem', fontSize: '12px' }}>
                        {i + 1}
                      </span>
                      <span style={{ color: i === 0 || i === usageCode.length - 1 ? 'var(--color-brand-500)' : 'var(--color-on-invert)' }}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CVA definition */}
              <div
                className="rounded-xl overflow-hidden border"
                style={{ background: 'var(--color-surface-invert)', borderColor: 'var(--color-border-invert)' }}
              >
                <div
                  className="flex items-center h-8 px-4 border-b text-[10px] font-medium uppercase tracking-wider"
                  style={{ background: 'var(--color-surface-invert-secondary)', borderColor: 'var(--color-border-invert)', color: 'var(--color-on-invert-muted)' }}
                >
                  button.variants.ts
                </div>
                <div className="p-4 font-mono text-[12px] leading-relaxed max-h-[340px] overflow-y-auto">
                  {cvaCode.map((line, i) => {
                    const isHighlighted = highlightIndices.includes(i);
                    return (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{
                          backgroundColor: isHighlighted ? 'rgba(249, 76, 16, 0.08)' : 'rgba(0,0,0,0)',
                        }}
                        transition={{ duration: 0.3 }}
                        className={isHighlighted ? 'code-highlight-line -mx-4 px-4' : '-mx-4 px-4'}
                      >
                        <span style={{ color: 'var(--color-on-invert-muted)', opacity: 0.4, userSelect: 'none', display: 'inline-block', width: '1.5rem', textAlign: 'right', marginRight: '0.75rem', fontSize: '11px' }}>
                          {i + 1}
                        </span>
                        <span style={{ color: 'var(--color-on-invert-secondary)' }}>{line}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
