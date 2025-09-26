# StemBot v1 Authentication Integration Guide

This guide provides step-by-step instructions for setting up and using the authentication foundation in your StemBot v1 application.

## 🚀 Quick Start

### 1. Database Setup

First, run the database schema and RLS policies in your Supabase project:

```sql
-- 1. Execute the schema
-- Copy and paste contents of src/lib/database/schema.sql into Supabase SQL Editor

-- 2. Execute the RLS policies
-- Copy and paste contents of src/lib/database/rls-policies.sql into Supabase SQL Editor
```

### 2. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Update environment variables with your Google OAuth credentials

### 4. Supabase Configuration

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Enable Google provider (if using OAuth)
3. Add your Google OAuth credentials
4. Set Site URL to your application URL
5. Add redirect URLs for development and production

## 📖 Usage Examples

### Basic Authentication Hook

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function ProfileComponent() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>

  return (
    <div>
      <h1>Welcome, {user?.profile?.display_name || user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}

// Role-based protection
export default function EducatorPage() {
  return (
    <ProtectedRoute allowedRoles={['educator', 'admin']}>
      <div>This content is only visible to educators and admins</div>
    </ProtectedRoute>
  )
}
```

### Conditional Rendering

```tsx
import { AuthGuard, RoleBasedRender } from '@/components/auth/AuthGuard'

export default function HomePage() {
  return (
    <div>
      <h1>StemBot</h1>

      <AuthGuard requireAuth={true}>
        <p>You are signed in!</p>
      </AuthGuard>

      <AuthGuard requireAuth={false} inverse>
        <p>Please sign in to continue</p>
      </AuthGuard>

      <RoleBasedRender
        student={<div>Student dashboard link</div>}
        educator={<div>Educator dashboard link</div>}
        admin={<div>Admin panel link</div>}
        unauthenticated={<div>Sign in to access dashboard</div>}
      />
    </div>
  )
}
```

### Server-Side Authentication

```tsx
// app/dashboard/page.tsx
import { getServerSession, getUserProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/login')
  }

  const profile = await getUserProfile(session.user.id)

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {profile?.display_name}</p>
    </div>
  )
}
```

### API Route Protection

```tsx
// app/api/profile/route.ts
import { requireAuthWithProfile } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { user, profile } = await requireAuthWithProfile()

    return NextResponse.json({ user: { id: user.id, email: user.email }, profile })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### Form Handling

```tsx
'use client'

import { useAuthForm } from '@/hooks/useAuth'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { handleSignIn, loading, error } = useAuthForm({
    onSuccess: () => {
      console.log('Signed in successfully!')
    },
    onError: (error) => {
      console.error('Sign in error:', error)
    }
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSignIn({ email, password })
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

## 🔧 Advanced Configuration

### Custom Redirect Handling

```tsx
// Custom protected route with specific redirect
<ProtectedRoute redirectTo="/custom-login">
  <SecretContent />
</ProtectedRoute>
```

### Profile Management

```tsx
'use client'

import { useProfile } from '@/hooks/useAuth'

export default function ProfileSettings() {
  const { profile, handleUpdateProfile, loading } = useProfile({
    onSuccess: () => console.log('Profile updated!'),
    onError: (error) => console.error('Update failed:', error)
  })

  const updateDisplayName = async (newName: string) => {
    await handleUpdateProfile({ display_name: newName })
  }

  return (
    <div>
      <h2>Profile Settings</h2>
      <p>Current name: {profile?.display_name}</p>
      <button
        onClick={() => updateDisplayName('New Name')}
        disabled={loading}
      >
        Update Name
      </button>
    </div>
  )
}
```

### Session Management

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function SessionManager() {
  const { session, refreshSession, isAuthenticated } = useAuth()

  useEffect(() => {
    // Refresh session every 30 minutes
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshSession()
      }
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshSession])

  return null // This is a background component
}
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- Never commit real environment variables to version control
- Use different Supabase projects for development/staging/production
- Rotate secrets regularly

### 2. Route Protection
- Always protect sensitive routes with middleware
- Use role-based access control appropriately
- Implement proper error handling for unauthorized access

### 3. Data Validation
- Validate user input on both client and server side
- Sanitize data before storing in database
- Use TypeScript for type safety

### 4. Session Management
- Implement session timeout handling
- Provide logout functionality on all protected pages
- Clear sensitive data on logout

## 🧪 Testing

### Test Authentication Flow

```tsx
// __tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/providers/AuthProvider'
import LoginForm from '@/components/LoginForm'

describe('Authentication', () => {
  it('should handle login flow', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })
})
```

## 🚨 Troubleshooting

### Common Issues

1. **Middleware not working**: Check that `middleware.ts` is in the root directory
2. **Session not persisting**: Verify Supabase configuration and NEXTAUTH_SECRET
3. **OAuth redirect errors**: Check Google OAuth configuration and redirect URIs
4. **Database errors**: Ensure RLS policies are properly configured
5. **TypeScript errors**: Make sure all types are properly imported

### Debug Mode

Enable debug logging by setting environment variable:
```env
DEBUG=supabase:auth
```

### Verify Setup

```tsx
// components/AuthDebug.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function AuthDebug() {
  const { user, session, loading, error } = useAuth()

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h3>Auth Debug Info</h3>
      <p>Loading: {loading.toString()}</p>
      <p>Error: {error || 'None'}</p>
      <p>User ID: {user?.id || 'Not signed in'}</p>
      <p>Email: {user?.email || 'N/A'}</p>
      <p>Role: {user?.profile?.role || 'N/A'}</p>
      <p>Session expires: {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
    </div>
  )
}
```

## 📚 Next Steps

With the authentication foundation in place, you can now:

1. **Build Login/Register Forms** (WP2): Create the actual UI components for authentication
2. **Implement Dashboard** (WP3): Build role-specific dashboards using the auth context
3. **Add Social Features**: Implement user profiles, progress sharing, etc.
4. **Enhance Security**: Add 2FA, session monitoring, and advanced security features

## 🔗 Related Files

- Authentication Types: `src/types/auth.ts`
- Supabase Client: `src/lib/supabase/client.ts`
- Server Utils: `src/lib/supabase/server.ts`
- Auth Middleware: `src/lib/supabase/middleware.ts`
- Protected Routes: `src/components/auth/ProtectedRoute.tsx`
- Auth Guards: `src/components/auth/AuthGuard.tsx`
- Auth Hooks: `src/hooks/useAuth.ts`
- Auth Provider: `src/providers/AuthProvider.tsx`
- Database Schema: `src/lib/database/schema.sql`
- RLS Policies: `src/lib/database/rls-policies.sql`