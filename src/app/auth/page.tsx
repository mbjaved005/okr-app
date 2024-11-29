'use client'
import React, { useState, useEffect } from 'react';
import LoginPage from '../login/page';
import RegisterPage from '../register/page';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState(false);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    console.log("Rendering login page");
  }, []);

  const toggleAuthMode = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setIsLogin((prev) => !prev);
    setPasswordRequirements(false);
  };

  const handleRegistrationSuccess = () => {
    setIsLogin(true);
  };

  const handlePasswordFocus = () => {
    setPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    setPasswordRequirements(false);
  };

  const handleFormValidation = (isValid: boolean) => {
    setFormValid(isValid);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h2 className="text-3xl font-extrabold text-center text-gray-900">
        {isLogin ? '' : 'Create a new account'}
      </h2>
      {isLogin ? (
        <>
          <LoginPage
            onPasswordFocus={handlePasswordFocus}
            onPasswordBlur={handlePasswordBlur}
            onFormValidation={handleFormValidation}
            onToggleAuthMode={toggleAuthMode}
          />
        </>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <RegisterPage onSuccess={handleRegistrationSuccess} onToggleAuthMode={toggleAuthMode} />
          </div>
        </div>
      )}
      {passwordRequirements && (
        <div className="mt-2 text-sm text-gray-600 animate-fade-in">
          Password must be at least 8 characters long and include a number and a special character.
        </div>
      )}
      {formValid && (
        <div className="mt-4 text-sm text-green-600 animate-pulse">
          All fields are valid. You can now submit the form.
        </div>
      )}
    </div>
  );
};

export default AuthPage;