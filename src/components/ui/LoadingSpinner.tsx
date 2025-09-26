/**
 * LoadingSpinner Component
 * 
 * A customizable loading spinner component with different sizes, variants,
 * and animation styles for various loading states.
 * 
 * Location: src/components/ui/LoadingSpinner.tsx
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

// Simple utility function to merge class names (replacing @/lib/utils)
function cn(...classes: (string | number | bigint | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',
        math: 'text-math-600',
        science: 'text-science-600',
        coding: 'text-coding-600',
      },
      speed: {
        slow: 'animate-spin [animation-duration:2s]',
        default: 'animate-spin',
        fast: 'animate-spin [animation-duration:0.5s]',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      speed: 'default',
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  showLabel?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size, 
    variant, 
    speed, 
    label = 'Loading...', 
    showLabel = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-2', className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant, speed }))} />
        {showLabel && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Dots Loading Animation
export interface DotsSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'math' | 'science' | 'coding';
}

const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-1 w-1',
      default: 'h-2 w-2',
      lg: 'h-3 w-3',
    };

    const variantClasses = {
      default: 'bg-primary',
      math: 'bg-math-600',
      science: 'bg-science-600',
      coding: 'bg-coding-600',
    };

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center space-x-1', className)}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <div
          className={cn(
            'animate-bounce rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn(
            'animate-bounce rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn(
            'animate-bounce rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{ animationDelay: '300ms' }}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

DotsSpinner.displayName = 'DotsSpinner';

// Pulse Loading Animation
export interface PulseSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'math' | 'science' | 'coding';
}

const PulseSpinner = React.forwardRef<HTMLDivElement, PulseSpinnerProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    const variantClasses = {
      default: 'bg-primary/20 border-primary',
      math: 'bg-math-600/20 border-math-600',
      science: 'bg-science-600/20 border-science-600',
      coding: 'bg-coding-600/20 border-coding-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-full border-2',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

PulseSpinner.displayName = 'PulseSpinner';

// Skeleton Loading Animation
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'rounded-md',
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-muted',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Loading Overlay Component
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  spinnerSize?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className,
    isLoading = false,
    spinnerSize = 'lg',
    message = 'Loading...',
    transparent = false,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center',
            transparent 
              ? 'bg-background/50 backdrop-blur-sm' 
              : 'bg-background/80'
          )}
        >
          <LoadingSpinner size={spinnerSize} showLabel label={message} />
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

export { 
  LoadingSpinner, 
  DotsSpinner, 
  PulseSpinner, 
  Skeleton,
  LoadingOverlay,
  spinnerVariants 
};