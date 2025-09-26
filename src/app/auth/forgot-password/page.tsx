/**
 * Forgot Password Page
 *
 * Password reset request page with consistent styling matching login and registration pages
 * Uses inline CSS for immediate compatibility and professional appearance
 */

'use client'

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import ForgotPasswordForm from '../../../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Reset Password - StemBot';
  }, []);

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '8px'
          }}>
            StemBot
          </h1>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Reset Password
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Functional Forgot Password Form */}
        <ForgotPasswordForm onBackToLogin={handleBackToLogin} />

        {/* Privacy Banner */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            🔒 Privacy-First • Local AI Processing
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🇺🇸 English
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🇳🇱 Nederlands
          </button>
        </div>

        {/* Remember Password Link */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Remember your password?{' '}
          <button
            onClick={handleBackToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.textDecoration = 'none';
            }}
          >
            Sign In
          </button>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}