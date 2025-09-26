/**
 * Toast Component
 * 
 * A notification toast component system with different variants, positioning,
 * and automatic dismissal. Self-contained implementation for accessibility.
 * 
 * Location: src/components/ui/Toast.tsx
 */

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

// Simple utility function to merge class names (replacing @/lib/utils)
function cn(...classes: (string | number | bigint | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string | undefined;
  description?: string | undefined;
  duration?: number | undefined;
  onClose?: (() => void) | undefined;
  action?: React.ReactNode | undefined;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, duration = 5000, onClose, action, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 200); // Allow time for exit animation
        }, duration);
        
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [duration, onClose]);

    if (!isVisible) {
return null;
}

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-semibold">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}

        <button
          type="button"
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose?.();
            }, 200);
          }}
          aria-label="Close notification"
        >
          <svg
            width="15"
            height="15"
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
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Container for managing multiple toasts
export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ position = 'top-right', className }, ref) => {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-[100] flex max-h-screen w-full max-w-sm flex-col space-y-2 p-4',
          positionClasses[position],
          className
        )}
      />
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

// Toast context and provider
interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex max-h-screen w-full max-w-sm flex-col space-y-2 p-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Utility toast functions
export const toast = {
  success: (title: string, description?: string  ) => {
    const context = React.useContext(ToastContext);
    if (context) {
      const toastData: Omit<ToastItem, 'id'> = {
        variant: 'success',
        title,
      };
      
      if (description !== undefined) {
        toastData.description = description;
      }
      
      return context.addToast(toastData);
    }
    console.log('Success toast:', title, description);
    return '';
  },
  
  error: (title: string, description?: string  ) => {
    const context = React.useContext(ToastContext);
    if (context) {
      const toastData: Omit<ToastItem, 'id'> = {
        variant: 'destructive',
        title,
      };
      
      if (description !== undefined) {
        toastData.description = description;
      }
      
      return context.addToast(toastData);
    }
    console.log('Error toast:', title, description);
    return '';
  },
  
  info: (title: string, description?: string  ) => {
    const context = React.useContext(ToastContext);
    if (context) {
      const toastData: Omit<ToastItem, 'id'> = {
        variant: 'info',
        title,
      };
      
      if (description !== undefined) {
        toastData.description = description;
      }
      
      return context.addToast(toastData);
    }
    console.log('Info toast:', title, description);
    return '';
  },
  
  warning: (title: string, description?: string  ) => {
    const context = React.useContext(ToastContext);
    if (context) {
      const toastData: Omit<ToastItem, 'id'> = {
        variant: 'warning',
        title,
      };
      
      if (description !== undefined) {
        toastData.description = description;
      }
      
      return context.addToast(toastData);
    }
    console.log('Warning toast:', title, description);
    return '';
  },
};

// Action button component for toasts
export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

ToastAction.displayName = 'ToastAction';

export {
  Toast,
  ToastContainer,
  ToastAction,
  toastVariants,
};