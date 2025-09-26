/**
 * ForgotPasswordForm Component
 *
 * Password reset request form component with validation and inline CSS styling
 * Allows users to request a password reset email by entering their email address
 * Matches the current authentication page design with enhanced validation features
 *
 * Location: src/components/auth/ForgotPasswordForm.tsx
 */

'use client'

import { useState } from 'react';

import { useAuthForm } from '../../hooks/useAuth';

interface ForgotPasswordFormProps {
  className?: string;
  onBackToLogin?: () => void;
}

interface FormData {
  email: string;
}

interface FormErrors {
  email: string;
  general: string;
}

interface TouchedFields {
  email: boolean;
}

export function ForgotPasswordForm({ className, onBackToLogin }: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    general: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    email: false
  });

  // Authentication hook integration
  const {
    handlePasswordReset,
    loading: authLoading,
    error: authError,
    clearError
  } = useAuthForm({
    onSuccess: () => {
      setSuccessMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      // Clear form data on success
      setFormData({ email: '' });
      setIsSubmitting(false);
    },
    onError: (error) => {
      setErrors(prev => ({ ...prev, general: error }));
      setIsSubmitting(false);
    }
  });

  // Combined loading state
  const isLoading = authLoading || isSubmitting;

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) {
return 'Email is required';
}
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      default:
        return '';
    }
  };

  // Update validation errors
  const updateErrors = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general and auth errors when user starts typing
    if (errors.general || authError) {
      setErrors(prev => ({ ...prev, general: '' }));
      clearError();
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Real-time validation for touched fields
    if (touchedFields[name as keyof TouchedFields]) {
      updateErrors(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTouchedFields(prev => ({ ...prev, [name]: true }));
    updateErrors(name, value);
  };

  // Check if form is valid
  const isFormValid = () => {
    // Exclude general error from validation check
    const fieldErrors = Object.entries(errors).filter(([key]) => key !== 'general');
    const hasErrors = fieldErrors.some(([, error]) => error !== '');
    const hasRequiredFields = formData.email;
    return !hasErrors && hasRequiredFields && !isLoading;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if already loading
    if (isLoading) {
return;
}

    // Clear previous errors
    setErrors(prev => ({ ...prev, general: '' }));
    clearError();
    setSuccessMessage('');
    setIsSubmitting(true);

    // Validate all fields
    const allErrors: FormErrors = {
      email: validateField('email', formData.email),
      general: ''
    };

    setErrors(allErrors);
    setTouchedFields({
      email: true
    });

    // Check if form is valid
    const hasErrors = Object.values(allErrors).filter(error => error !== '').length > 1; // Exclude general error
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      await handlePasswordReset(formData.email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to send reset email. Please try again.'
      }));
      setIsSubmitting(false);
    }
  };

  // Get border color based on validation state
  const getBorderColor = (fieldName: keyof FormErrors, isFocused: boolean = false): string => {
    if (isFocused) {
return '#2563eb';
}
    if (touchedFields[fieldName as keyof TouchedFields] && errors[fieldName]) {
return '#dc2626';
}
    return isLoading ? '#9ca3af' : '#d1d5db';
  };

  // Get display error (prioritize field errors over auth errors)
  const getDisplayError = () => {
    return errors.general || authError || '';
  };

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>✅</span>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {getDisplayError() && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>❌</span>
          {getDisplayError()}
        </div>
      )}


      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            📧 Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="email"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${getBorderColor('email')}`,
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.borderColor = '#2563eb';
              target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              handleBlur(e);
              target.style.borderColor = getBorderColor('email');
              target.style.boxShadow = 'none';
            }}
          />
          {touchedFields.email && errors.email && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* Send Reset Link Button */}
        <button
          type="submit"
          disabled={!isFormValid()}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: isFormValid() ? '#2563eb' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isFormValid() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
            opacity: isFormValid() ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            if (isFormValid() && !isLoading) {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = '#1d4ed8';
              target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (isFormValid() && !isLoading) {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = '#2563eb';
              target.style.transform = 'translateY(0)';
            }
          }}
        >
          {isLoading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {/* Add keyframes for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>

      {/* Back to Login Link */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={onBackToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'none',
            padding: '0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
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
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;