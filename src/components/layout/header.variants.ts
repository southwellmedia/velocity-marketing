import { cva, type VariantProps } from 'class-variance-authority';

export const headerVariants = cva('z-50 w-full', {
  variants: {
    position: {
      fixed: 'fixed top-0 left-0 right-0',
      sticky: 'sticky top-0',
      static: 'relative',
    },
    variant: {
      default: 'bg-background/80 backdrop-blur-lg border-b border-border/50',
      solid: 'bg-background border-b border-border',
      transparent: 'bg-transparent',
    },
  },
  defaultVariants: {
    position: 'sticky',
    variant: 'default',
  },
});

export const headerInnerVariants = cva(
  'mx-auto max-w-6xl px-6 flex items-center justify-between',
  {
    variants: {
      size: {
        sm: 'h-12',
        md: 'h-14',
        lg: 'h-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type HeaderVariants = VariantProps<typeof headerVariants>;
export type HeaderInnerVariants = VariantProps<typeof headerInnerVariants>;
