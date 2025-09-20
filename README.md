# StemBot v1

An AI-powered STEM education platform built with privacy-first principles for Dutch students, educators, and parents.

## 🚀 Features

- **Privacy-First AI Tutoring**: Local AI processing via Ollama for secure, private learning experiences
- **Adaptive Learning**: Personalized learning paths that adapt to individual student progress
- **Dutch Education Aligned**: Curriculum-aligned content for Dutch educational standards
- **Multi-Role Support**: Tailored experiences for students, educators, and parents
- **Real-Time Collaboration**: Supabase-powered real-time features for classroom interaction

## 🏗️ Architecture

- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: Supabase for authentication, data storage, and real-time features
- **UI Components**: Radix UI primitives with custom Tailwind design system
- **AI Processing**: Local Ollama integration for privacy-compliant AI tutoring
- **Styling**: Tailwind CSS with STEM-specific color schemes and components
- **Testing**: Jest, Playwright, and Storybook for comprehensive testing

## 🛠️ Development

### Prerequisites

- Node.js 18+ or 22+
- npm or yarn
- Supabase account and project
- Ollama (for local AI features)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase and other API credentials in `.env.local`

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Essential Commands

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run analyze` - Analyze bundle size

#### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

#### Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests

#### Database
- `npm run db:generate` - Generate TypeScript types from Supabase schema
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

#### Environment
- `npm run env:check` - Validate environment configuration

## 📁 Project Structure

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
│   ├── config/            # Environment and configuration management
│   ├── supabase/          # Supabase client and utilities
│   └── utils/             # Utility functions and helpers
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

The project uses a comprehensive design system with:

- **STEM Subject Colors**: Math (blue), Science (green), Coding (purple)
- **Educational Components**: Lesson cards, progress bars, chat interfaces
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Dark Mode**: System-aware theme switching
- **Mobile-First**: Responsive design optimized for all devices

## 🔒 Security & Privacy

- **Local AI Processing**: No data sent to external AI services
- **Row-Level Security**: Supabase RLS policies for data protection
- **Environment Validation**: Comprehensive validation of all configuration
- **Authentication**: Secure email/password and OAuth integration

## 📚 Documentation

- [`CLAUDE.md`](./CLAUDE.md) - Complete development guide and command reference
- [`CHANGELOG.md`](./CHANGELOG.md) - Detailed development history and implementation notes
- [`src/styles/README.md`](./src/styles/README.md) - Design system documentation

## 🤝 Contributing

1. Follow the TypeScript strict mode requirements
2. Run `npm run type-check` and `npm run lint` before committing
3. Ensure all tests pass with `npm test`
4. Use the established design system and component patterns

## 📄 License

This project is developed for educational purposes with privacy-first principles.

---

For detailed development instructions and architectural patterns, see [`CLAUDE.md`](./CLAUDE.md).

