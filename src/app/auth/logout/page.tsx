'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Create Supabase client directly
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        await supabase.auth.signOut();
        // Redirect to home page after successful logout
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        // Still redirect to home even if there's an error
        router.push('/');
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          👋
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Signing you out...
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '16px'
        }}>
          Thanks for using StemBot! You'll be redirected to the home page.
        </p>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}