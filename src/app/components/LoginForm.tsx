'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/utils/jwt';
import '../styles/auth.css';

interface LoginFormProps {
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
  onFormValidation?: (isValid: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onPasswordFocus,
  onPasswordBlur,
  onFormValidation
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isValid = email.includes('@') && password.length >= 8;
    onFormValidation?.(isValid);
  }, [email, password, onFormValidation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log("Attempting login with email:", email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response received:", { status: response.status });

      if (response.ok && data.token) {
        console.log("Login successful, storing token");
        setToken(data.token);
        setValidationMessage('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        console.error("Login failed:", data.message);
        setError(data.message || 'Invalid credentials');
        const inputElement = document.querySelector('.auth-input.error') as HTMLElement;
        if (inputElement) {
          inputElement.classList.remove('error');
          void inputElement.offsetWidth; // Trigger reflow
          inputElement.classList.add('error');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace available');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFocus = () => {
    console.log("Password field focused");
    onPasswordFocus?.();
  };

  const handlePasswordBlur = () => {
    console.log("Password field blurred");
    onPasswordBlur?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="flex justify-center mb-8">
          <img src="/emumba-logo.png" alt="Emumba" className="h-12" />
        </div>

        <h1 className="text-3xl font-bold text-[#2C2C2C] text-center mb-8">Welcome Back</h1>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {validationMessage && (
          <div className="success-message" role="status">
            {validationMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#e66000] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;