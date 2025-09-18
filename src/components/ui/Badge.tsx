/**
 * Badge Component
 * 
 * A flexible badge component for displaying status, categories, achievements,
 * and gamification elements with different variants and styles.
 * 
 * Location: src/components/ui/Badge.tsx
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Simple utility function to merge class names (replacing @/lib/utils)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        math: 'border-transparent bg-math-100 text-math-800 dark:bg-math-900 dark:text-math-300',
        science: 'border-transparent bg-science-100 text-science-800 dark:bg-science-900 dark:text-science-300',
        coding: 'border-transparent bg-coding-100 text-coding-800 dark:bg-coding-900 dark:text-coding-300',
        // Gamification badge rarities
        common: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        rare: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 shadow-glow',
        epic: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 shadow-lg animate-glow',
        legendary: 'border-transparent bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl animate-pulse',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[0.65rem]',
        lg: 'px-3 py-1 text-sm',
      },
      interactive: {
        false: '',
        true: 'cursor-pointer hover:scale-105 active:scale-95',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removeButton?: boolean;
  onRemove?: () => void;
  animated?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive,
    icon, 
    removeButton = false,
    onRemove,
    animated = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    // Fix the type issue by properly determining if component is clickable
    const isClickable = Boolean(interactive) || Boolean(onClick);

    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, interactive: isClickable }),
          animated && 'animate-badge-pop',
          className
        )}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Call onClick directly if it exists
            if (onClick) {
              // Create a minimal event-like object or call without event
              onClick({} as React.MouseEvent<HTMLDivElement>);
            }
          }
        } : undefined}
        {...props}
      >
        {icon && (
          <span className="mr-1 flex-shrink-0">
            {icon}
          </span>
        )}
        
        <span className="truncate">{children}</span>
        
        {removeButton && onRemove && (
          <button
            type="button"
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove badge"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m11.7816 4.03157c.0824-.08205.0824-.21569 0-.29774-.0821-.08205-.2157-.08205-.2978 0L7.50002 7.70743 3.51656 3.73383c-.08205-.08205-.21569-.08205-.29774 0-.08205.08205-.08205.21569 0 .29774L7.20228 8.00157l-3.98346 3.97363c-.08205.0821-.08205.2157 0 .2978.08205.0821.21569.0821.29774 0L7.50002 8.30571l3.98346 3.97363c.0821.0821.2157.0821.2978 0 .0824-.0821.0824-.2157 0-.2978L7.79776 8.00157l3.98346-3.97z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Achievement Badge Component for Gamification
export interface AchievementBadgeProps extends Omit<BadgeProps, 'variant'> {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  description?: string;
  progress?: {
    current: number;
    total: number;
  };
}

const AchievementBadge = React.forwardRef<HTMLDivElement, AchievementBadgeProps>(
  ({ 
    rarity, 
    earnedAt, 
    description, 
    progress,
    children,
    className,
    ...props 
  }, ref) => {
    const getRarityIcon = (): string => {
      switch (rarity) {
        case 'common': return '🥉';
        case 'rare': return '🥈';
        case 'epic': return '🥇';
        case 'legendary': return '👑';
        default: return '';
      }
    };

    return (
      <Badge
        ref={ref}
        variant={rarity}
        icon={<span>{getRarityIcon()}</span>}
        className={cn(
          'relative',
          rarity === 'legendary' && 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
          className
        )}
        title={description}
        animated={Boolean(earnedAt)}
        {...props}
      >
        <div className="flex flex-col items-center">
          <span>{children}</span>
          {progress && (
            <span className="text-[0.6rem] opacity-75">
              {progress.current}/{progress.total}
            </span>
          )}
          {earnedAt && (
            <span className="text-[0.6rem] opacity-75">
              {earnedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      </Badge>
    );
  }
);

AchievementBadge.displayName = 'AchievementBadge';

export { Badge, AchievementBadge, badgeVariants };