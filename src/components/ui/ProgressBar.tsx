/**
 * ProgressBar Component
 * 
 * A customizable progress bar component with animations, different variants,
 * and accessibility features for tracking learning progress.
 * 
 * Location: src/components/ui/ProgressBar.tsx
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

// Simple utility function to merge class names (replacing @/lib/utils)
function cn(...classes: (string | number | bigint | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-2',
        default: 'h-4',
        lg: 'h-6',
      },
      variant: {
        default: 'bg-secondary',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const progressFillVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
      },
      animated: {
        false: '',
        true: 'animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  color?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({
    className,
    value = 0,
    max = 100,
    size,
    variant,
    showValue = false,
    showPercentage = false,
    animated = false,
    label,
    color,
    ...props
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const [displayValue, setDisplayValue] = React.useState(animated ? 0 : percentage);

    React.useEffect(() => {
      if (animated) {
        const timer = setTimeout(() => {
          setDisplayValue(percentage);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setDisplayValue(percentage);
      }
      // Return undefined explicitly for the else case
      return undefined;
    }, [percentage, animated]);

    return (
      <div className="w-full space-y-2">
        {(label || showValue || showPercentage) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {(showValue || showPercentage) && (
              <span className="text-sm text-muted-foreground">
                {showValue && `${value}/${max}`}
                {showValue && showPercentage && ' '}
                {showPercentage && `(${Math.round(percentage)}%)`}
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size, variant }), className)}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(
              progressFillVariants({ variant, animated })
            )}
            style={{
              transform: `translateX(-${100 - displayValue}%)`,
              ...(color && { backgroundColor: color }),
            }}
          >
            {animated && displayValue > 0 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Circular Progress variant
export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default';
  showValue?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showValue = false,
    className,
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorMap = {
      default: '#3b82f6',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <svg
          className="-rotate-90 transform"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[variant]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { ProgressBar, CircularProgress, progressVariants, progressFillVariants };