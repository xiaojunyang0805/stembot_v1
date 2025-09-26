/**
 * Password Reset Page
 *
 * Handles the password reset flow when users click on email reset links
 * Conditionally renders different components based on the reset flow state
 */

'use client'

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import PasswordResetSuccess from '../../../components/auth/PasswordResetSuccess';
import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetStep, setResetStep] = useState<'form' | 'success'>('form');
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Check for reset token in URL parameters
    const urlToken = searchParams.get('token') ?? searchParams.get('access_token');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error !== null) {
      // Handle error cases (expired token, invalid token, etc.)
      console.error('Reset password error:', error, errorDescription);
      setIsValidToken(false);
    } else if (urlToken !== null) {
      setToken(urlToken);
      setIsValidToken(true);
    } else {
      // No token provided - redirect to forgot password page
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const handlePasswordResetSuccess = () => {
    setResetStep('success');
  };

  const handleGoToLogin = () => {
    router.push('/auth/login?message=You can now log in with your new password');
  };

  // Show error if invalid token
  if (!isValidToken) {
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
          maxWidth: '500px'
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* Header */}
            <div style={{marginBottom: '32px'}}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2563eb',
                marginBottom: '8px'
              }}>
                StemBot
              </h1>
            </div>

            {/* Error Icon */}
            <div style={{
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px'
              }}>
                ❌
              </div>
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Invalid or Expired Link
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              This password reset link has expired or is invalid. Please request a new password reset.
            </p>

            <button
              onClick={() => router.push('/auth/forgot-password')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#2563eb';
              }}
            >
              Request New Reset Link
            </button>

            {/* Privacy Banner */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '24px',
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
        maxWidth: resetStep === 'success' ? '500px' : '400px'
      }}>
        {resetStep === 'form' && (
          <>
            {/* Header for Reset Form */}
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
                Set New Password
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: 0
              }}>
                Enter your new password below
              </p>
            </div>

            <ResetPasswordForm
              token={token ?? undefined}
              onSuccess={handlePasswordResetSuccess}
            />

            {/* Privacy Banner */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '24px',
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
          </>
        )}

        {resetStep === 'success' && (
          <PasswordResetSuccess
            onGoToLogin={handleGoToLogin}
            redirectDelay={5}
          />
        )}

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