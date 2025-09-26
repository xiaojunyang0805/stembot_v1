/**
 * Input Component
 * 
 * A flexible input component with validation states, icons, and accessibility features.
 * Supports different variants, sizes, and helper text.
 * 
 * Location: src/components/ui/Input.tsx
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

// Simple utility function to merge class names (replacing @/lib/utils)
function cn(...classes: (string | number | bigint | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  inputSize?: 'default' | 'sm' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant,
    inputSize,
    label,
    helperText,
    errorText,
    leftIcon,
    rightIcon,
    isLoading,
    id,
    disabled,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    const helperTextId = `${inputId}-helper`;
    const errorTextId = `${inputId}-error`;
    
    const finalVariant = errorText ? 'error' : variant;
    const isDisabled = disabled || isLoading;

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            inputVariants({ variant: finalVariant, inputSize }),
            leftIcon && 'pl-10',
            (rightIcon || isLoading) && 'pr-10',
            className
          )}
          ref={ref}
          id={inputId}
          disabled={isDisabled}
          aria-describedby={cn(
            helperText && helperTextId,
            errorText && errorTextId
          )}
          aria-invalid={errorText ? 'true' : 'false'}
          {...props}
        />
        
        {(rightIcon || isLoading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
    );

    if (label || helperText || errorText) {
      return (
        <div className="space-y-2">
          {label && (
            <label 
              htmlFor={inputId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          
          {inputElement}
          
          {errorText && (
            <p 
              id={errorTextId}
              className="text-sm text-red-500"
              role="alert"
            >
              {errorText}
            </p>
          )}
          
          {helperText && !errorText && (
            <p 
              id={helperTextId}
              className="text-sm text-muted-foreground"
            >
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };