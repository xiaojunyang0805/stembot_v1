/**
 * EmailVerification Component
 *
 * Basic component structure for email verification flow
 * Includes placeholder verification UI with inline CSS styling
 * Supports different verification states and user interactions
 *
 * Location: src/components/auth/EmailVerification.tsx
 */

'use client'

import { useState, useEffect } from 'react';

export type VerificationStatus = 'pending' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete?: (verified: boolean) => void;
  onResendEmail?: () => void;
  className?: string;
}

export function EmailVerification({
  email,
  onVerificationComplete,
  onResendEmail,
  className
}: EmailVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend functionality
  useEffect(() => {
    if (status === 'sent' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setCanResend(true);
    }
  }, [status, timeRemaining]);

  const handleSendVerification = () => {
    setStatus('sending');
    // TODO: Implement actual email sending logic
    setTimeout(() => {
      setStatus('sent');
      setTimeRemaining(60);
      setCanResend(false);
    }, 2000);
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
return;
}

    setStatus('verifying');
    // TODO: Implement actual verification logic
    setTimeout(() => {
      // Simulate verification result
      const isValid = verificationCode === '123456'; // Placeholder validation
      if (isValid) {
        setStatus('verified');
        onVerificationComplete?.(true);
      } else {
        setStatus('error');
      }
    }, 1500);
  };

  const handleResendEmail = () => {
    setVerificationCode('');
    setStatus('sending');
    setTimeRemaining(60);
    setCanResend(false);
    onResendEmail?.();
    // TODO: Implement actual resend logic
    setTimeout(() => {
      setStatus('sent');
    }, 1000);
  };

  // Render different UI based on verification status
  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📧
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px',
              margin: 0
            }}>
              Verify Your Email
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px',
              margin: '8px 0 24px 0'
            }}>
              We'll send a verification code to{' '}
              <span style={{ fontWeight: '500', color: '#2563eb' }}>
                {email}
              </span>
            </p>
            <button
              onClick={handleSendVerification}
              style={{
                width: '100%',
                padding: '12px',
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
              Send Verification Code
            </button>
          </div>
        );

      case 'sending':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>
              📤
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px',
              margin: 0
            }}>
              Sending Code...
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '8px 0 0 0'
            }}>
              Please wait while we send the verification code to your email.
            </p>
          </div>
        );

      case 'sent':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                ✉️
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
                margin: 0
              }}>
                Check Your Email
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '8px 0 0 0'
              }}>
                We've sent a 6-digit code to{' '}
                <span style={{ fontWeight: '500', color: '#2563eb' }}>
                  {email}
                </span>
              </p>
            </div>

            {/* Verification Code Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                🔢 Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '18px',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#2563eb';
                  target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#d1d5db';
                  target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: verificationCode.length === 6 ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                if (verificationCode.length === 6) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseOut={(e) => {
                if (verificationCode.length === 6) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#2563eb';
                }
              }}
            >
              Verify Code
            </button>

            {/* Resend Code */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                Didn't receive the code?
              </p>
              {canResend ? (
                <button
                  onClick={handleResendEmail}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Resend Code
                </button>
              ) : (
                <span style={{
                  fontSize: '14px',
                  color: '#9ca3af'
                }}>
                  Resend in {timeRemaining}s
                </span>
              )}
            </div>
          </div>
        );

      case 'verifying':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>
              ⏳
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px',
              margin: 0
            }}>
              Verifying Code...
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '8px 0 0 0'
            }}>
              Please wait while we verify your code.
            </p>
          </div>
        );

      case 'verified':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ✅
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#059669',
              marginBottom: '8px',
              margin: 0
            }}>
              Email Verified!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '8px 0 0 0'
            }}>
              Your email has been successfully verified. You can now continue with your registration.
            </p>
          </div>
        );

      case 'error':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ❌
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '8px',
              margin: 0
            }}>
              Verification Failed
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px',
              margin: '8px 0 24px 0'
            }}>
              The verification code you entered is incorrect. Please try again.
            </p>
            <button
              onClick={() => {
                setStatus('sent');
                setVerificationCode('');
              }}
              style={{
                width: '100%',
                padding: '12px',
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
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {renderContent()}

      {/* Help Text */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{
            fontSize: '13px',
            color: '#0369a1',
            margin: 0
          }}>
            Check your spam folder if you don't see the email. The code expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;