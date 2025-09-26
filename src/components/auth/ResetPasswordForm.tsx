/**
 * ResetPasswordForm Component
 *
 * Password reset form component with validation and inline CSS styling
 * Allows users to set a new password using their reset token
 * Includes password strength validation matching registration requirements
 *
 * Location: src/components/auth/ResetPasswordForm.tsx
 */

'use client'

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordFormProps {
  className?: string;
  token?: string;
  onSuccess?: () => void;
}

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password: string;
  confirmPassword: string;
  general: string;
}

interface TouchedFields {
  password: boolean;
  confirmPassword: boolean;
}

type PasswordStrength = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

export function ResetPasswordForm({ className, token, onSuccess }: ResetPasswordFormProps) {
  const router = useRouter();
  const { updatePassword, loading: authLoading, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    password: '',
    confirmPassword: '',
    general: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    password: false,
    confirmPassword: false
  });

  // Combined loading state
  const isLoading = authLoading || isSubmitting;

  // Password validation functions (same as RegisterForm)
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
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        if (!value) {
return 'Please confirm your password';
}
        return value === formData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  // Update validation errors
  const updateErrors = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Also validate confirm password when password changes
    if (name === 'password' && touchedFields.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
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
    const hasRequiredFields = formData.password && formData.confirmPassword;
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
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      general: ''
    };

    setErrors(allErrors);
    setTouchedFields({
      password: true,
      confirmPassword: true
    });

    // Check if form is valid
    const hasErrors = Object.values(allErrors).filter(error => error !== '').length > 1; // Exclude general error
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(formData.password);
      setSuccessMessage('Password updated successfully! Redirecting to login...');

      // Clear form data on success
      setFormData({
        password: '',
        confirmPassword: ''
      });

      // Redirect to login after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/auth/login?message=Password reset successful. Please log in with your new password.');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Password update error:', error);

      let errorMessage = 'Failed to update password. Please try again.';

      // Handle specific error cases
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        errorMessage = 'Reset link has expired or is invalid. Please request a new reset link.';
      }

      setErrors(prev => ({
        ...prev,
        general: error.message || errorMessage
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
        {/* New Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            🔒 New Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="new-password"
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
            🔒 Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="new-password"
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

        {/* Update Password Button */}
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
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </button>

        {/* Add keyframes for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </div>
  );
}

export default ResetPasswordForm;