/**
 * RegisterForm Component
 *
 * Comprehensive registration form component with validation and inline CSS styling
 * Includes real-time validation, password strength indicator, and user feedback
 * Matches the current registration page design with enhanced validation features
 *
 * Location: src/components/auth/RegisterForm.tsx
 */

'use client'

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthForm } from '../../hooks/useAuth';

import type { UserType } from './UserTypeSelector';

interface RegisterFormProps {
  className?: string;
  redirectTo?: string;
  inviteToken?: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  termsAccepted: boolean;
}

interface FormErrors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: string;
  general: string;
}

interface TouchedFields {
  fullName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  terms: boolean;
}

type PasswordStrength = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

export function RegisterForm({ className, redirectTo, inviteToken }: RegisterFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    termsAccepted: false
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
    general: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false
  });

  // Authentication hook integration
  const {
    handleSignUp,
    handleGoogleSignIn,
    loading: authLoading,
    error: authError,
    clearError
  } = useAuthForm({
    onSuccess: () => {
      setSuccessMessage('Account created successfully! Redirecting...');
      // Clear form data on success
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'student',
        termsAccepted: false
      });
      // Redirect based on user type
      setTimeout(() => {
        const redirectPath = formData.userType === 'educator' ? '/educator/dashboard' : '/dashboard';
        router.push(redirectPath);
      }, 1500);
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

  // Password validation functions
  const validatePassword = (password: string): string => {
    if (!password) {
return 'Password is required';
}
    if (password.length < 8) {
return 'Password must be at least 8 characters';
}
    if (!/[A-Z]/.test(password)) {
return 'Password must contain at least one uppercase letter';
}
    if (!/[a-z]/.test(password)) {
return 'Password must contain at least one lowercase letter';
}
    if (!/[0-9]/.test(password)) {
return 'Password must contain at least one number';
}
    return '';
  };

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) {
score++;
}
    if (/[A-Z]/.test(password)) {
score++;
}
    if (/[a-z]/.test(password)) {
score++;
}
    if (/[0-9]/.test(password)) {
score++;
}
    if (/[^A-Za-z0-9]/.test(password)) {
score++;
}

    if (score === 0) {
return 'very-weak';
}
    if (score === 1) {
return 'very-weak';
}
    if (score === 2) {
return 'weak';
}
    if (score === 3) {
return 'fair';
}
    if (score === 4) {
return 'good';
}
    return 'strong';
  };

  const getPasswordStrengthLabel = (strength: PasswordStrength): string => {
    const labels = {
      'very-weak': 'Very Weak',
      'weak': 'Weak',
      'fair': 'Fair',
      'good': 'Good',
      'strong': 'Strong'
    };
    return labels[strength];
  };

  const getPasswordStrengthColor = (strength: PasswordStrength): string => {
    const colors = {
      'very-weak': '#dc2626',
      'weak': '#ea580c',
      'fair': '#ca8a04',
      'good': '#16a34a',
      'strong': '#059669'
    };
    return colors[strength];
  };

  // Validation functions
  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case 'fullName':
        return !value ? 'Full name is required' : '';
      case 'email':
        if (!value) {
return 'Email is required';
}
        return emailRegex.test(value as string) ? '' : 'Please enter a valid email address';
      case 'password':
        return validatePassword(value as string);
      case 'confirmPassword':
        if (!value) {
return 'Please confirm your password';
}
        return value === formData.password ? '' : 'Passwords do not match';
      case 'termsAccepted':
        return value ? '' : 'You must accept the terms and conditions';
      default:
        return '';
    }
  };

  // Update validation errors
  const updateErrors = (name: string, value: string | boolean) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name === 'termsAccepted' ? 'terms' : name]: error }));

    // Also validate confirm password when password changes
    if (name === 'password' && touchedFields.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
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
      updateErrors(name, newValue as string | boolean);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouchedFields(prev => ({ ...prev, [name]: true }));
    updateErrors(name, fieldValue as string | boolean);
  };

  // Check if form is valid
  const isFormValid = () => {
    // Exclude general error from validation check
    const fieldErrors = Object.entries(errors).filter(([key]) => key !== 'general');
    const hasErrors = fieldErrors.some(([, error]) => error !== '');
    const hasRequiredFields = formData.fullName && formData.email && formData.password &&
                             formData.confirmPassword && formData.termsAccepted;
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
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      terms: validateField('termsAccepted', formData.termsAccepted),
      general: ''
    };

    setErrors(allErrors);
    setTouchedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    // Check if form is valid
    const hasErrors = Object.values(allErrors).filter(error => error !== '').length > 1; // Exclude general error
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map userType to role
      const roleMapping = {
        'student': 'researcher' as const,
        'educator': 'researcher' as const,
        'parent': 'researcher' as const // All users are researchers in this platform
      };

      await handleSignUp({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        role: roleMapping[formData.userType],
        acceptTerms: formData.termsAccepted,
        acceptPrivacy: formData.termsAccepted // Using same value for both
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to create account. Please try again.'
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

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    if (isLoading) {
return;
}

    try {
      setErrors(prev => ({ ...prev, general: '' }));
      clearError();
      setSuccessMessage('');
      await handleGoogleSignIn();
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to sign up with Google'
      }));
    }
  };

  // Get display error (prioritize field errors over auth errors)
  const getDisplayError = () => {
    return errors.general || authError || '';
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    if (!password) {
return null;
}

    const strength = getPasswordStrength(password);
    const strengthColor = getPasswordStrengthColor(strength);
    const strengthLabel = getPasswordStrengthLabel(strength);

    // Calculate number of filled segments
    const strengthValues = {
      'very-weak': 1,
      'weak': 2,
      'fair': 3,
      'good': 4,
      'strong': 5
    };
    const filledSegments = strengthValues[strength];

    return (
      <div style={{ marginTop: '8px' }}>
        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '4px'
        }}>
          {[1, 2, 3, 4, 5].map((segment) => (
            <div
              key={segment}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: segment <= filledSegments ? strengthColor : '#e5e7eb',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>
        {/* Strength Label */}
        <div style={{
          fontSize: '12px',
          color: strengthColor,
          fontWeight: '500'
        }}>
          Password strength: {strengthLabel}
        </div>
      </div>
    );
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
      {/* Full Name Field */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          👤 Full Name
        </label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${getBorderColor('fullName')}`,
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
            target.style.borderColor = getBorderColor('fullName');
            target.style.boxShadow = 'none';
          }}
        />
        {touchedFields.fullName && errors.fullName && (
          <div style={{
            fontSize: '12px',
            color: '#dc2626',
            marginTop: '4px'
          }}>
            {errors.fullName}
          </div>
        )}
      </div>

      {/* Email Field */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          📧 Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
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

      {/* Password Field */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          🔒 Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${getBorderColor('password')}`,
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
            target.style.borderColor = getBorderColor('password');
            target.style.boxShadow = 'none';
          }}
        />
        {touchedFields.password && errors.password && (
          <div style={{
            fontSize: '12px',
            color: '#dc2626',
            marginTop: '4px'
          }}>
            {errors.password}
          </div>
        )}
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      {/* Confirm Password Field */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          🔒 Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${getBorderColor('confirmPassword')}`,
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
            target.style.borderColor = getBorderColor('confirmPassword');
            target.style.boxShadow = 'none';
          }}
        />
        {touchedFields.confirmPassword && errors.confirmPassword && (
          <div style={{
            fontSize: '12px',
            color: '#dc2626',
            marginTop: '4px'
          }}>
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {/* User Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          👤 I am a:
        </label>
        <select
          name="userType"
          value={formData.userType}
          onChange={handleInputChange}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${isLoading ? '#9ca3af' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            backgroundColor: isLoading ? '#f9fafb' : 'white',
            outline: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <option value="student">Student</option>
          <option value="educator">Educator</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* Terms and Conditions */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          color: '#374151',
          cursor: 'pointer',
          gap: '8px'
        }}>
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isLoading}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#2563eb',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          />
          <span>
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {touchedFields.terms && errors.terms && (
          <div style={{
            fontSize: '12px',
            color: '#dc2626',
            marginTop: '4px'
          }}>
            {errors.terms}
          </div>
        )}
      </div>

      {/* Temporary Service Notice */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#92400e',
        textAlign: 'center'
      }}>
        ⚠️ <strong>Temporary Service Notice:</strong> Email registration is currently experiencing technical issues.
        Please use <strong>Google Sign In</strong> below to register quickly and securely.
      </div>

      {/* Create Account Button - Temporarily Disabled */}
      <button
        type="button"
        disabled={true}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'not-allowed',
          transition: 'all 0.2s ease',
          marginBottom: '16px',
          opacity: 0.6,
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
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Google Sign Up Button - Primary Option */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: isLoading ? '#f3f4f6' : '#4285f4',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.6 : 1,
          color: 'white',
          boxShadow: '0 2px 4px rgba(66, 133, 244, 0.3)'
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#3367d6';
            target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#4285f4';
            target.style.transform = 'translateY(0)';
          }
        }}
      >
        {isLoading ? (
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid transparent',
            borderTop: '2px solid #9ca3af',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {isLoading ? 'Creating your account...' : 'Create Account with Google'}
      </button>
    </form>

    {/* Sign In Link */}
    <div style={{
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '24px'
    }}>
      Already have an account?{' '}
      <a
        href="/auth/login"
        style={{
          color: '#2563eb',
          textDecoration: 'none',
          fontWeight: '500'
        }}
        onMouseOver={(e) => {
          const target = e.target as HTMLAnchorElement;
          target.style.textDecoration = 'underline';
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLAnchorElement;
          target.style.textDecoration = 'none';
        }}
      >
        Sign In
      </a>
    </div>
    </div>
  );
}

export default RegisterForm;