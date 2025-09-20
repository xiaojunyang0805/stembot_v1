/**
 * RegisterForm Component
 *
 * Basic registration form component with inline CSS styling
 * Matches the current registration page design with form fields for
 * email, password, confirm password, and user type selector.
 *
 * Location: src/components/auth/RegisterForm.tsx
 */

'use client'

import { useState } from 'react';

interface RegisterFormProps {
  className?: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'student' | 'educator' | 'parent';
}

export function RegisterForm({ className }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add form submission logic
    console.log('Form submitted:', formData);
  };

  return (
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
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
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
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
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
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
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
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
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

      {/* User Type Selector */}
      <div style={{ marginBottom: '24px' }}>
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
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="student">Student</option>
          <option value="educator">Educator</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* Create Account Button */}
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px'
        }}
        onMouseOver={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#1d4ed8';
          target.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#2563eb';
          target.style.transform = 'translateY(0)';
        }}
      >
        Create Account
      </button>

      {/* Google Sign Up Button */}
      <button
        type="button"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#f3f4f6';
          target.style.borderColor = '#9ca3af';
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.backgroundColor = '#f9fafb';
          target.style.borderColor = '#d1d5db';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

export default RegisterForm;