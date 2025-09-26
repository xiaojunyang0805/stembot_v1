/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary blue for math
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Secondary green for science
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea', // Accent purple for coding
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // STEM Subject Colors
        math: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        science: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        coding: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Status Colors
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#ea580c', // Warning orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Error red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Info blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        privacy: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6', // Privacy violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Gamification Colors
        badge: {
          common: '#6b7280',
          rare: '#3b82f6',
          epic: '#9333ea',
          legendary: '#f59e0b',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        display: [
          'Cal Sans',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0125em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.0125em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '9xl': ['8rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        // Educational specific sizes
        caption: ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],
        overline: ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.1em' }],
        button: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        label: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        hero: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        display: ['4rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      spacing: {
        // Extended spacing scale following 8px grid
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
        '26': '6.5rem',    // 104px
        '30': '7.5rem',    // 120px
        '34': '8.5rem',    // 136px
        '38': '9.5rem',    // 152px
        '42': '10.5rem',   // 168px
        '46': '11.5rem',   // 184px
        '50': '12.5rem',   // 200px
        '88': '22rem',     // 352px
        '128': '32rem',    // 512px
        '144': '36rem',    // 576px
        '160': '40rem',    // 640px
        '192': '48rem',    // 768px
        '224': '56rem',    // 896px
        '256': '64rem',    // 1024px
        // Educational specific spacing
        'lesson': '3rem',     // Standard lesson spacing
        'section': '2rem',    // Section spacing
        'component': '1.5rem', // Component spacing
        'element': '1rem',    // Element spacing
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'scale3d(1, 1, 1)' },
          '40%, 43%': { transform: 'scale3d(1.15, 0.85, 1)' },
          '70%': { transform: 'scale3d(0.95, 1.05, 1)' },
          '90%': { transform: 'scale3d(1.02, 0.98, 1)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        'typing': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-right': 'slide-in-from-right 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'typing': 'typing 2s steps(40, end)',
        'badge-pop': 'badge-pop 0.5s ease-out',
        'progress-fill': 'progress-fill 1s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgb(59 130 246 / 0.5)',
        'glow': '0 0 10px rgb(59 130 246 / 0.5)',
        'glow-lg': '0 0 20px rgb(59 130 246 / 0.5)',
        'inner-glow': 'inset 0 0 10px rgb(59 130 246 / 0.2)',
        'math': '0 0 20px rgb(37 99 235 / 0.3)',
        'science': '0 0 20px rgb(22 163 74 / 0.3)',
        'coding': '0 0 20px rgb(147 51 234 / 0.3)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-math': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-science': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-coding': 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '475px',
      },
      zIndex: {
        '100': '100',
      },
      aspectRatio: {
        'card': '3 / 2',
        'video': '16 / 9',
        'golden': '1.618 / 1',
        'lesson': '4 / 3',
        'avatar': '1 / 1',
        'banner': '5 / 2',
      },
      transitionDuration: {
        '50': '50ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'smooth-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'smooth-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'educational': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            '[class~="lead"]': {
              color: 'inherit',
            },
            strong: {
              color: 'inherit',
              fontWeight: '600',
            },
            'ol[type="A"]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a"]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="A" s]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a" s]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="I"]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i"]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="I" s]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i" s]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="1"]': {
              '--list-counter-style': 'decimal',
            },
            h1: {
              color: 'inherit',
              fontWeight: '800',
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'inherit',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            code: {
              color: 'inherit',
              fontWeight: '600',
            },
            'a code': {
              color: 'inherit',
            },
            pre: {
              color: 'inherit',
              backgroundColor: 'rgb(var(--color-surface))',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: 'var(--tw-prose-th-borders)',
            },
            'thead th': {
              color: 'inherit',
              fontWeight: '600',
              verticalAlign: 'bottom',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'var(--tw-prose-td-borders)',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              verticalAlign: 'baseline',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    
    // Custom plugin for STEM-specific utilities
    function ({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.text-math': {
          color: theme('colors.math.600'),
        },
        '.text-science': {
          color: theme('colors.science.600'),
        },
        '.text-coding': {
          color: theme('colors.coding.600'),
        },
        '.bg-math': {
          backgroundColor: theme('colors.math.500'),
        },
        '.bg-science': {
          backgroundColor: theme('colors.science.500'),
        },
        '.bg-coding': {
          backgroundColor: theme('colors.coding.500'),
        },
        '.border-math': {
          borderColor: theme('colors.math.300'),
        },
        '.border-science': {
          borderColor: theme('colors.science.300'),
        },
        '.border-coding': {
          borderColor: theme('colors.coding.300'),
        },
        '.shadow-math': {
          boxShadow: theme('boxShadow.math'),
        },
        '.shadow-science': {
          boxShadow: theme('boxShadow.science'),
        },
        '.shadow-coding': {
          boxShadow: theme('boxShadow.coding'),
        },
      });

      addComponents({
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 2px ${theme('colors.primary.500')}`,
          },
        },
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.soft'),
          border: `1px solid ${theme('colors.gray.200')}`,
        },
        '.dark .card': {
          backgroundColor: theme('colors.gray.800'),
          borderColor: theme('colors.gray.700'),
        },
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
        },
        '.progress-bar': {
          width: '100%',
          backgroundColor: theme('colors.gray.200'),
          borderRadius: theme('borderRadius.full'),
          overflow: 'hidden',
          height: theme('spacing.2'),
        },
        '.dark .progress-bar': {
          backgroundColor: theme('colors.gray.700'),
        },
        '.loading-dots': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.1'),
          '& > div': {
            width: theme('spacing.2'),
            height: theme('spacing.2'),
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            animation: 'pulse 1.4s ease-in-out infinite both',
          },
          '& > div:nth-child(1)': { animationDelay: '-0.32s' },
          '& > div:nth-child(2)': { animationDelay: '-0.16s' },
          '& > div:nth-child(3)': { animationDelay: '0s' },
        },
      });
    },
  ],
};