# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run analyze` - Analyze bundle size with webpack-bundle-analyzer

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changing files
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

### Database (Supabase)
- `npm run db:generate` - Generate TypeScript types from Supabase schema
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

### Documentation
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Project Architecture

### Framework & Stack
- **Next.js 14** with App Router for full-stack React application
- **TypeScript** with strict type checking enabled
- **Tailwind CSS** with custom design system for STEM education themes
- **Supabase** for database, authentication, and real-time features
- **Radix UI** as the foundation for accessible component primitives

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── auth/              # Authentication pages (login, register)
│   ├── dashboard/         # Student dashboard and project management
│   ├── educator/          # Educator-specific features and analytics
│   └── billing/           # Subscription and payment pages
├── components/
│   └── ui/                # Reusable UI components based on Radix UI
├── lib/
│   ├── utils/             # Utility functions and helpers
│   └── utils.ts           # Core utilities (cn, debounce, etc.)
└── types/                 # TypeScript type definitions
```

### Key Architecture Patterns

**Component Architecture**: Uses Radix UI primitives with custom styling via Tailwind CSS. Components follow shadcn/ui patterns with variants using class-variance-authority.

**Styling System**: Comprehensive Tailwind config with STEM-specific color palettes:
- Math subjects: Blue variants (`math-*` classes)
- Science subjects: Green variants (`science-*` classes)
- Coding subjects: Purple variants (`coding-*` classes)
- Custom animations for gamification features

**Path Aliases**: Configured in tsconfig.json:
- `@/*` maps to `src/*`
- `@/components/*` maps to `src/components/*`
- `@/lib/*` maps to `src/lib/*`
- `@/utils/*` maps to `src/lib/utils/*`

**AI Integration**: Built for local AI processing with Ollama integration. API routes proxy to local Ollama instance for privacy-first AI tutoring.

**Authentication**: Supabase Auth with Next.js App Router integration. Route groups organize authenticated vs public pages.

**Testing Strategy**:
- Unit tests with Jest and React Testing Library
- E2E tests with Playwright across multiple browsers
- Component testing with Storybook
- Separate test environments for unit vs integration tests

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- No implicit any, strict null checks, and unused variable detection
- Custom path mapping for clean imports

### Styling Conventions
- Use Tailwind utility classes with the `cn()` helper for conditional styling
- STEM subject colors: `text-math`, `bg-science`, `border-coding`, etc.
- Custom animations available: `animate-badge-pop`, `animate-glow`, `animate-float`

### Component Development
- Follow Radix UI + Tailwind patterns from existing UI components
- Use `forwardRef` for components that need DOM access
- Implement proper accessibility with ARIA attributes

### Database Integration
- Supabase types are generated via `npm run db:generate`
- Use proper TypeScript interfaces for database models
- Real-time subscriptions available for collaborative features

### AI Features
- Local processing via Ollama for privacy compliance
- API routes handle AI model interactions
- Structured for personalized learning path generation

### Performance Considerations
- Next.js Image optimization configured for educational content
- Bundle analysis available via `npm run analyze`
- Lazy loading and code splitting implemented
- SVG handling via @svgr/webpack

## Error Handling & Debugging

When encountering build errors:
1. Run `npm run type-check` to identify TypeScript issues
2. Check `npm run lint` for code quality problems
3. Verify path aliases match tsconfig.json configuration
4. For Supabase errors, ensure environment variables are configured

Common commands to run after making changes:
1. `npm run type-check` - Verify TypeScript compatibility
2. `npm run lint` - Check code quality
3. `npm test` - Run unit tests to verify functionality

To completely solve the persistant login issue, I will replace all old supabaseUr to new "https://kutpbtpdgptcmrlabekq.supabase.co". 
- Going through git add/commit/push process in serial without my permission unless error occurs.
- In future don't run local test, we only do vercel deployment for web test.
- After debugging, do git add/commit/push in serial, then trigger vercel build.
- In future, after debugging, do git add/commit/push in serial without asking permission, go automatically.