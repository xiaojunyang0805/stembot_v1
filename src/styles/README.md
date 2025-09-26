# StemBot v1 Design System & Tailwind Configuration

A comprehensive design system for the StemBot v1 educational platform with full dark mode support, accessibility features, and educational-specific styling.

## 🎨 Brand Colors

### Primary Colors
```typescript
// Math/Logic subjects
text-math-600     // #2563eb
bg-math-500       // #3b82f6
border-math-300   // #93c5fd

// Science/Biology subjects
text-science-600  // #16a34a
bg-science-500    // #22c55e
border-science-300 // #86efac

// Technology/Coding subjects
text-coding-600   // #9333ea
bg-coding-500     // #a855f7
border-coding-300 // #d8b4fe
```

### Status Colors
```typescript
// Success (achievements, correct answers)
bg-success-500    // #22c55e
text-success-600  // #16a34a

// Error (mistakes, validation errors)
bg-error-500      // #ef4444
text-error-600    // #dc2626

// Warning (alerts, notifications)
bg-warning-600    // #ea580c
text-warning-700  // #c2410c

// Info (hints, information)
bg-info-500       // #3b82f6
text-info-600     // #2563eb

// Privacy (local/offline indicators)
bg-privacy-500    // #8b5cf6
text-privacy-600  // #7c3aed
```

## 📝 Typography

### Font Families
```css
font-sans    /* Inter for UI text */
font-mono    /* JetBrains Mono for code */
font-display /* Cal Sans for headings */
```

### Educational Typography Scale
```css
text-hero     /* 3.5rem - Main headings */
text-display  /* 4rem - Feature displays */
text-caption  /* 0.625rem - Small captions */
text-overline /* 0.625rem - Overline text */
text-button   /* 0.875rem - Button text */
text-label    /* 0.75rem - Form labels */
```

## 📏 Spacing System

8px grid system with educational-specific utilities:

```css
/* Standard spacing follows 8px grid */
space-y-2      /* 8px vertical spacing */
space-y-4      /* 16px vertical spacing */
space-y-8      /* 32px vertical spacing */

/* Educational-specific spacing */
p-lesson       /* 3rem - Standard lesson spacing */
p-section      /* 2rem - Section spacing */
p-component    /* 1.5rem - Component spacing */
p-element      /* 1rem - Element spacing */
```

## 🎭 Animations & Transitions

### Timing Functions
```css
transition-smooth          /* cubic-bezier(0.4, 0, 0.2, 1) */
transition-bounce-soft     /* cubic-bezier(0.68, -0.55, 0.265, 1.55) */
transition-educational     /* cubic-bezier(0.25, 0.46, 0.45, 0.94) */
```

### Durations
```css
duration-50    /* 50ms - Instant feedback */
duration-150   /* 150ms - Quick interactions */
duration-250   /* 250ms - Standard transitions */
duration-350   /* 350ms - Slower transitions */
```

### Educational Animations
```css
animate-badge-pop     /* Badge earning animation */
animate-progress-fill /* Progress bar fill */
animate-float         /* Floating elements */
animate-glow          /* Glow effect for success */
animate-shake         /* Error feedback */
```

## 🎯 Component Classes

### Buttons
```html
<!-- Primary button -->
<button class="btn-primary">
  Start Learning
</button>

<!-- Secondary button -->
<button class="btn-secondary">
  Cancel
</button>

<!-- Outline button -->
<button class="btn-outline">
  Learn More
</button>
```

### Cards
```html
<!-- Standard card -->
<div class="card">
  <h3>Lesson Title</h3>
  <p>Lesson description...</p>
</div>

<!-- Educational lesson card -->
<div class="lesson-card">
  <h3>Mathematics: Algebra Basics</h3>
  <p>Learn the fundamentals of algebra...</p>
</div>

<!-- Subject-specific cards -->
<div class="card subject-card-math">Math Lesson</div>
<div class="card subject-card-science">Science Lesson</div>
<div class="card subject-card-coding">Coding Lesson</div>
```

### Chat Interface
```html
<!-- User message -->
<div class="message-bubble-user">
  How do I solve this equation?
</div>

<!-- AI response -->
<div class="message-bubble-ai">
  Let me help you with that equation step by step...
</div>

<!-- Typing indicator -->
<div class="typing-indicator">
  AI is typing...
</div>
```

### Progress & Status
```html
<!-- Progress bar -->
<div class="progress-bar">
  <div class="progress-fill bg-math-500" style="width: 75%"></div>
</div>

<!-- Status badges -->
<span class="badge bg-success-100 text-success-800">Completed</span>
<span class="badge bg-warning-100 text-warning-800">In Progress</span>
<span class="badge bg-error-100 text-error-800">Failed</span>
```

## 🌙 Dark Mode

Dark mode is automatically handled via CSS custom properties and the `dark` class:

```html
<!-- Automatically adapts to dark mode -->
<div class="bg-background text-foreground">
  <div class="card">
    <h2 class="text-2xl font-bold">Adaptive Content</h2>
    <p class="text-muted-foreground">This text adapts to light/dark mode</p>
  </div>
</div>
```

### Dark Mode Utilities
```css
/* Manual dark mode styling if needed */
.dark\:bg-gray-800  /* Only in dark mode */
.dark\:text-white   /* Only in dark mode */
```

## 📱 Responsive Design

Mobile-first breakpoints with educational considerations:

```css
sm:   /* 640px  - Small tablets */
md:   /* 768px  - Tablets */
lg:   /* 1024px - Small laptops */
xl:   /* 1280px - Desktops */
2xl:  /* 1536px - Large screens */
xs:   /* 475px  - Large phones (custom) */
```

### Responsive Utilities
```html
<!-- Responsive lesson layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="lesson-card">...</div>
  <div class="lesson-card">...</div>
  <div class="lesson-card">...</div>
</div>

<!-- Responsive typography -->
<h1 class="text-2xl md:text-3xl lg:text-hero">
  Welcome to StemBot
</h1>
```

## ♿ Accessibility Features

### Focus States
All interactive elements have proper focus states:
```css
focus:outline-none focus:ring-2 focus:ring-primary-500
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  /* Enhanced contrast for elements */
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled */
}
```

### WCAG Compliance
- All color combinations meet WCAG 2.1 AA contrast ratios
- Focus indicators are clearly visible
- Text is scalable up to 200% without horizontal scrolling

## 🎯 Educational-Specific Utilities

### Subject Identification
```html
<div class="text-math">Mathematics content</div>
<div class="text-science">Science content</div>
<div class="text-coding">Programming content</div>

<div class="bg-math-100 border-math-300">Math section</div>
<div class="shadow-science">Science highlight</div>
```

### Gamification Elements
```html
<!-- Achievement badges -->
<span class="badge bg-badge-legendary text-white">Legendary</span>
<span class="badge bg-badge-epic text-white">Epic</span>
<span class="badge bg-badge-rare text-white">Rare</span>

<!-- Privacy indicators -->
<span class="privacy-badge">
  🔒 Local Processing
</span>
```

## 🔧 Custom Properties

Access design tokens via CSS custom properties:

```css
/* Colors */
var(--color-math)           /* #2563eb */
var(--color-science)        /* #16a34a */
var(--color-coding)         /* #9333ea */

/* Layout */
var(--layout-lesson-width)  /* 56rem */
var(--layout-sidebar-width) /* 16rem */
var(--layout-header-height) /* 4rem */

/* Animation */
var(--duration-fast)        /* 150ms */
var(--duration-normal)      /* 250ms */
var(--duration-slow)        /* 350ms */
```

## 📦 Usage Examples

### Learning Dashboard
```html
<div class="min-h-screen bg-background">
  <header class="h-16 bg-card border-b border-border">
    <div class="container mx-auto px-4 h-full flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">StemBot</h1>
      <button class="btn-primary">New Lesson</button>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="lesson-card subject-card-math">
        <h3 class="text-lg font-semibold text-math mb-2">Algebra Basics</h3>
        <p class="text-muted-foreground mb-4">Learn fundamental algebraic concepts</p>
        <div class="progress-bar mb-4">
          <div class="progress-fill bg-math-500" style="width: 60%"></div>
        </div>
        <button class="btn-outline w-full">Continue Learning</button>
      </div>
    </div>
  </main>
</div>
```

### Chat Interface
```html
<div class="flex flex-col h-screen bg-background">
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <div class="message-bubble-ai">
      Hi! I'm your AI tutor. What would you like to learn today?
    </div>
    <div class="message-bubble-user">
      Can you help me with quadratic equations?
    </div>
    <div class="typing-indicator"></div>
  </div>

  <div class="border-t border-border p-4">
    <div class="flex gap-2">
      <input
        type="text"
        placeholder="Ask me anything..."
        class="flex-1 px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-primary-500"
      >
      <button class="btn-primary">Send</button>
    </div>
  </div>
</div>
```

## 🚀 Performance

- CSS custom properties enable efficient theme switching
- Purged CSS in production removes unused styles
- Optimized animations use GPU acceleration
- Critical CSS is inlined for faster first paint

## 🔄 Theme Integration

Works seamlessly with `next-themes`:

```typescript
import { ThemeProvider } from 'next-themes'

function App({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
```