/**
 * Section Components
 *
 * Reusable components for creating organized, sectioned layouts
 * with consistent styling and visual hierarchy.
 *
 * Location: src/components/ui/Section.tsx
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const sectionVariants = cva(
  'transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
        light: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600',
        card: 'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800',
        transparent: 'bg-transparent border-none',
        accent: 'bg-blue-50/30 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700',
        success: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700',
        info: 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      spacing: {
        none: 'mb-0',
        sm: 'mb-3',
        default: 'mb-6',
        lg: 'mb-8',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-lg',
        lg: 'rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'light',
      padding: 'default',
      spacing: 'default',
      rounded: 'default',
    },
  }
);

const sectionHeaderVariants = cva(
  'flex items-center justify-between',
  {
    variants: {
      size: {
        sm: 'text-sm font-medium',
        default: 'text-lg font-semibold',
        lg: 'text-xl font-semibold',
        xl: 'text-2xl font-bold',
      },
      border: {
        none: '',
        bottom: 'pb-3 mb-4 border-b border-gray-200 dark:border-gray-600',
      },
    },
    defaultVariants: {
      size: 'default',
      border: 'bottom',
    },
  }
);

const sectionContentVariants = cva(
  '',
  {
    variants: {
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-2',
        default: 'space-y-4',
        lg: 'space-y-6',
      },
    },
    defaultVariants: {
      spacing: 'default',
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {}

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface SectionContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionContentVariants> {}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, variant, padding, spacing, rounded, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sectionVariants({ variant, padding, spacing, rounded }), className)}
      {...props}
    />
  )
);
Section.displayName = 'Section';

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, size, border, title, subtitle, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sectionHeaderVariants({ size, border }), className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h2 className="text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
);
SectionHeader.displayName = 'SectionHeader';

const SectionContent = React.forwardRef<HTMLDivElement, SectionContentProps>(
  ({ className, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sectionContentVariants({ spacing }), className)}
      {...props}
    />
  )
);
SectionContent.displayName = 'SectionContent';

const SectionDivider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn('my-4 border-t border-gray-200 dark:border-gray-600', className)}
      {...props}
    />
  )
);
SectionDivider.displayName = 'SectionDivider';

// Preset section combinations for common use cases
const WelcomeSection = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <Section
      ref={ref}
      variant="accent"
      className={cn('', className)}
      {...props}
    >
      {children}
    </Section>
  )
);
WelcomeSection.displayName = 'WelcomeSection';

const InfoSection = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <Section
      ref={ref}
      variant="info"
      className={cn('', className)}
      {...props}
    >
      {children}
    </Section>
  )
);
InfoSection.displayName = 'InfoSection';

const CardSection = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <Section
      ref={ref}
      variant="card"
      className={cn('', className)}
      {...props}
    >
      {children}
    </Section>
  )
);
CardSection.displayName = 'CardSection';

export {
  Section,
  SectionHeader,
  SectionContent,
  SectionDivider,
  WelcomeSection,
  InfoSection,
  CardSection,
  sectionVariants,
  sectionHeaderVariants,
  sectionContentVariants,
};