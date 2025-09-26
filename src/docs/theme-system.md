# StemBot v1 Theme System Documentation

A comprehensive theme system designed specifically for educational environments, providing seamless dark/light mode switching with accessibility features and educational context awareness.

## 🌟 Features

- **Hydration-safe theme switching** - No flash of wrong theme
- **Educational context awareness** - Optimized for learning environments
- **Accessibility first** - WCAG 2.1 AA compliant with reduced motion support
- **TypeScript throughout** - Complete type safety
- **Multiple toggle variants** - Simple, educational, dropdown options
- **Theme-aware components** - Automatic color adaptation
- **Performance optimized** - Minimal bundle impact

## 🚀 Quick Start

### 1. Basic Setup

The theme system is already integrated into your app layout. To use theme toggle components:

```tsx
import { SimpleThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>StemBot</h1>
      <SimpleThemeToggle />
    </header>
  )
}
```

### 2. Educational Context Toggle

For educational environments with contextual information:

```tsx
import { EducationalThemeToggle } from '@/components/common/ThemeToggle'

export function ClassroomHeader() {
  return (
    <div className="bg-card p-6 rounded-lg">
      <EducationalThemeToggle
        showLabel={true}
        size="lg"
      />
    </div>
  )
}
```

### 3. Full Feature Dropdown

For settings pages or comprehensive theme control:

```tsx
import { DropdownThemeToggle } from '@/components/common/ThemeToggle'

export function SettingsPanel() {
  return (
    <div className="space-y-4">
      <h3>Appearance Settings</h3>
      <DropdownThemeToggle
        includeSystem={true}
        size="md"
      />
    </div>
  )
}
```

## 🎨 Theme-Aware Components

### Using the Theme Hook

```tsx
import { useTheme } from '@/hooks/useTheme'

export function MyComponent() {
  const {
    resolvedTheme,
    isDarkMode,
    isLightMode,
    toggleTheme,
    isLoading
  } = useTheme()

  if (isLoading) {
    return <div>Loading theme...</div>
  }

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'light' : 'dark'} mode
      </button>
    </div>
  )
}
```

### Theme-Aware Styling

```tsx
import { useThemeStyles } from '@/hooks/useTheme'

export function AdaptiveCard() {
  const { getThemeClasses, getThemeValue } = useThemeStyles()

  return (
    <div className={getThemeClasses(
      'bg-white border-gray-200',     // light mode
      'bg-gray-800 border-gray-700'   // dark mode
    )}>
      <h2 style={{
        color: getThemeValue('#1f2937', '#f9fafb')
      }}>
        Adaptive Content
      </h2>
    </div>
  )
}
```

### Subject-Specific Cards

```tsx
import { SubjectCard } from '@/components/common/ThemeAwareComponents'

export function LessonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SubjectCard
        subject="math"
        title="Algebra Basics"
        description="Learn fundamental algebraic concepts"
        progress={75}
        onClick={() => console.log('Math lesson clicked')}
      />

      <SubjectCard
        subject="science"
        title="Physics Fundamentals"
        description="Explore the laws of physics"
        progress={45}
        onClick={() => console.log('Science lesson clicked')}
      />

      <SubjectCard
        subject="coding"
        title="JavaScript Basics"
        description="Introduction to programming"
        progress={90}
        onClick={() => console.log('Coding lesson clicked')}
      />
    </div>
  )
}
```

## 🏫 Educational Features

### Study Mode Indicator

Shows theme optimization for learning contexts:

```tsx
import { StudyModeIndicator } from '@/components/common/ThemeAwareComponents'

export function StudySession() {
  return (
    <div className="p-6">
      <StudyModeIndicator className="mb-4" />
      <div>
        {/* Study content */}
      </div>
    </div>
  )
}
```

### Educational Theme Context

Get contextual information about current theme:

```tsx
import { useEducationalTheme } from '@/hooks/useTheme'

export function ThemeInfo() {
  const { optimal, description, icon } = useEducationalTheme()

  return (
    <div className="bg-muted p-4 rounded-lg">
      <h4>Current Theme Context</h4>
      <p>{description}</p>
      <div className="flex gap-2 mt-2">
        {optimal.map(context => (
          <span key={context} className="badge">
            {context}
          </span>
        ))}
      </div>
    </div>
  )
}
```

### Learning Dashboard Layout

Complete dashboard with theme-aware styling:

```tsx
import {
  LearningDashboard,
  EducationalHeader,
  ThemeAwareCard
} from '@/components/common/ThemeAwareComponents'

export function Dashboard() {
  const sidebar = (
    <div className="space-y-4">
      <ThemeAwareCard subject="general">
        <h3>Quick Actions</h3>
        {/* Sidebar content */}
      </ThemeAwareCard>
    </div>
  )

  return (
    <LearningDashboard
      sidebar={sidebar}
      showThemeContext={true}
    >
      <EducationalHeader
        title="Welcome to StemBot"
        subtitle="Your AI-powered learning companion"
        showThemeIndicator={true}
      />

      <div className="mt-8">
        {/* Main content */}
      </div>
    </LearningDashboard>
  )
}
```

## ♿ Accessibility Features

### Reduced Motion Support

The theme system automatically respects user preferences:

```tsx
import { useThemeAccessibility } from '@/hooks/useTheme'

export function AccessibleComponent() {
  const {
    prefersReducedMotion,
    prefersHighContrast,
    getAccessibilityProps
  } = useThemeAccessibility()

  return (
    <div
      {...getAccessibilityProps()}
      className={`
        transition-all
        ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
        ${prefersHighContrast ? 'border-2' : 'border'}
      `}
    >
      <p>This component respects accessibility preferences</p>
    </div>
  )
}
```

### Keyboard Navigation

All theme toggles support keyboard navigation:

```tsx
// Theme toggles automatically include:
// - Tab navigation
// - Enter/Space activation
// - ARIA labels
// - Screen reader announcements

<SimpleThemeToggle />  // Fully accessible out of the box
```

## 🎯 Best Practices

### 1. Use Theme-Aware Classes

Prefer Tailwind's dark mode classes:

```tsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ❌ Avoid direct theme checking when possible
const { isDarkMode } = useTheme()
<div className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
```

### 2. Maintain Educational Branding

Subject colors remain consistent across themes:

```tsx
// ✅ Subject colors adapt automatically
<div className="text-math-600 dark:text-math-400">Math Content</div>
<div className="bg-science-100 dark:bg-science-900/20">Science Section</div>
```

### 3. Handle Loading States

Always handle theme loading for hydration safety:

```tsx
import { useTheme } from '@/hooks/useTheme'

export function ThemeAwareComponent() {
  const { isLoading, resolvedTheme } = useTheme()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-20 rounded" />
  }

  return (
    <div className={`theme-${resolvedTheme}`}>
      Content loads after theme is ready
    </div>
  )
}
```

### 4. Educational Context

Consider learning environment when placing theme toggles:

```tsx
// ✅ Good placement for classroom use
<header className="flex justify-between items-center p-4">
  <Logo />
  <div className="flex items-center gap-4">
    <StudentProgress />
    <EducationalThemeToggle showLabel={false} />
  </div>
</header>

// ✅ Good for settings page
<SettingsSection title="Appearance">
  <DropdownThemeToggle includeSystem={true} />
  <ThemeContextIndicator />
</SettingsSection>
```

## 🔧 Advanced Usage

### Custom Theme Detection

Create custom theme-aware logic:

```tsx
import { useTheme } from '@/hooks/useTheme'

export function useCustomThemeLogic() {
  const { resolvedTheme, setTheme } = useTheme()

  const isStudyTime = () => {
    const hour = new Date().getHours()
    return hour >= 18 || hour <= 6 // Evening/night
  }

  const suggestOptimalTheme = () => {
    if (isStudyTime()) {
      return 'dark' // Better for evening study
    }
    return 'light' // Better for daytime
  }

  const autoOptimize = () => {
    const suggested = suggestOptimalTheme()
    if (resolvedTheme !== suggested) {
      setTheme(suggested)
    }
  }

  return {
    suggestOptimalTheme,
    autoOptimize,
    isStudyTime: isStudyTime()
  }
}
```

### Theme Persistence Across Tabs

Sync theme changes across browser tabs:

```tsx
import { useThemeSync } from '@/hooks/useTheme'

export function GlobalThemeManager() {
  const { broadcastThemeChange } = useThemeSync()

  const handleThemeChange = (newTheme: string) => {
    // This will sync across all open tabs
    broadcastThemeChange(newTheme)
  }

  return (
    <div>
      <button onClick={() => handleThemeChange('dark')}>
        Set Dark Theme (All Tabs)
      </button>
    </div>
  )
}
```

## 🧪 Testing

### Manual Testing Checklist

1. **Theme Switching**
   - [ ] Light to dark transition is smooth
   - [ ] Dark to light transition is smooth
   - [ ] System theme detection works
   - [ ] No flash of wrong theme on page load

2. **Educational Components**
   - [ ] Subject cards maintain branding in both themes
   - [ ] Progress indicators are visible in both themes
   - [ ] Theme context information is accurate

3. **Accessibility**
   - [ ] Theme toggle is keyboard accessible
   - [ ] Screen reader announces theme changes
   - [ ] High contrast mode is respected
   - [ ] Reduced motion preference is honored

4. **Performance**
   - [ ] No layout shift during theme changes
   - [ ] Theme loads quickly on first visit
   - [ ] No unnecessary re-renders

### Testing Components

Test theme integration:

```tsx
// Test utility for theme verification
export function ThemeTestComponent() {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className="p-4 border">
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={toggleTheme} className="btn-primary">
        Toggle Theme
      </button>

      {/* Visual verification */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-math-100 dark:bg-math-900 p-4 rounded">
          Math Color
        </div>
        <div className="bg-science-100 dark:bg-science-900 p-4 rounded">
          Science Color
        </div>
        <div className="bg-coding-100 dark:bg-coding-900 p-4 rounded">
          Coding Color
        </div>
      </div>
    </div>
  )
}
```

## 🚀 Performance Tips

1. **Lazy Load Theme Components**
   ```tsx
   const ThemeToggle = lazy(() => import('@/components/common/ThemeToggle'))
   ```

2. **Memoize Theme-Dependent Calculations**
   ```tsx
   const themeStyles = useMemo(() =>
     getThemeClasses('light-class', 'dark-class'),
     [resolvedTheme]
   )
   ```

3. **Reduce Re-renders**
   ```tsx
   const MemoizedThemeCard = memo(ThemeAwareCard)
   ```

## 🔗 Integration Points

The theme system integrates with:

- **Tailwind CSS** - Uses CSS custom properties
- **Next.js 13+** - App Router compatible
- **Accessibility APIs** - Respects system preferences
- **StemBot Brand System** - Maintains educational colors
- **TypeScript** - Full type safety throughout

## 📚 API Reference

### Hooks
- `useTheme()` - Main theme management hook
- `useThemeStyles()` - Theme-aware styling utilities
- `useEducationalTheme()` - Educational context information
- `useThemeAccessibility()` - Accessibility preferences
- `useThemeSync()` - Cross-tab theme synchronization

### Components
- `SimpleThemeToggle` - Basic light/dark toggle
- `EducationalThemeToggle` - Educational context toggle
- `DropdownThemeToggle` - Full theme selection
- `ThemeIndicator` - Current theme display
- `SubjectCard` - Theme-aware subject cards
- `LearningDashboard` - Complete dashboard layout

### Providers
- `ThemeProvider` - Main theme context provider
- `ThemeErrorBoundary` - Error handling for theme system