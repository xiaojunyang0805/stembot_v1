/**
 * PasswordResetSuccess Component
 *
 * Success confirmation component for completed password reset flow
 * Shows success message with auto-redirect and manual navigation options
 * Matches the current authentication page design with consistent styling
 *
 * Location: src/components/auth/PasswordResetSuccess.tsx
 */

'use client'

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

interface PasswordResetSuccessProps {
  className?: string;
  redirectDelay?: number; // in seconds, default 5
  onGoToLogin?: () => void;
}

export function PasswordResetSuccess({
  className,
  redirectDelay = 5,
  onGoToLogin
}: PasswordResetSuccessProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectDelay);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-redirect to login
          if (onGoToLogin) {
            onGoToLogin();
          } else {
            router.push('/auth/login?message=You can now log in with your new password');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [router, onGoToLogin]);

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      router.push('/auth/login?message=You can now log in with your new password');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Success Icon */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#dcfce7',
          border: '2px solid #bbf7d0',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          animation: 'bounceIn 0.6s ease-out'
        }}>
          ✅
        </div>
      </div>

      {/* Success Message */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px'
        }}>
          Password Reset Complete!
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#16a34a',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Your password has been successfully updated.
        </p>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          You can now use your new password to log in to your account.
        </p>
      </div>

      {/* Countdown and Auto-redirect */}
      {countdown > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          color: '#0369a1',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            Automatically redirecting to login in{' '}
            <span style={{
              fontWeight: '700',
              fontSize: '16px',
              color: '#1d4ed8'
            }}>
              {countdown}
            </span>
            {countdown === 1 ? ' second' : ' seconds'}...
          </p>
        </div>
      )}

      {/* Manual Navigation Button */}
      <button
        onClick={handleGoToLogin}
        style={{
          width: '100%',
          maxWidth: '300px',
          padding: '14px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          margin: '0 auto'
        }}
        onMouseOver={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#1d4ed8';
          target.style.transform = 'translateY(-1px)';
          target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#2563eb';
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = 'none';
        }}
      >
        🚀 Go to Login
      </button>

      {/* Additional Help */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: '#fafafa',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#374151' }}>
          💡 Having trouble?
        </p>
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          If you continue to experience issues logging in, please contact our support team for assistance.
        </p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          70% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default PasswordResetSuccess;