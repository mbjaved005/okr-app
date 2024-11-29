'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FormInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  requirements?: string[];
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  pattern,
  minLength,
  maxLength,
  autoComplete,
  requirements = []
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showRequirements, setShowRequirements] = useState(false);

  useEffect(() => {
    console.log(`FormInput: ${label} mounted`);
    return () => {
      console.log(`FormInput: ${label} unmounted`);
    };
  }, [label]);

  const validateInput = (value: string): boolean => {
    if (required && !value) {
      console.log(`FormInput: ${label} validation failed - required field is empty`);
      return false;
    }
    if (pattern && !new RegExp(pattern).test(value)) {
      console.log(`FormInput: ${label} validation failed - pattern mismatch`);
      return false;
    }
    if (minLength && value.length < minLength) {
      console.log(`FormInput: ${label} validation failed - minimum length not met`);
      return false;
    }
    if (maxLength && value.length > maxLength) {
      console.log(`FormInput: ${label} validation failed - maximum length exceeded`);
      return false;
    }
    console.log(`FormInput: ${label} validation passed`);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const valid = validateInput(newValue);
    setIsValid(valid);
    onChange(newValue);
    console.log(`FormInput: ${label} value changed to ${newValue}`);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (type === 'password' && requirements.length > 0) {
      setShowRequirements(true);
    }
    console.log(`FormInput: ${label} focused`);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowRequirements(false);
    const valid = validateInput(value);
    setIsValid(valid);
    console.log(`FormInput: ${label} blurred`);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
          borderColor: !isValid ? '#ef4444' : isFocused ? '#3b82f6' : '#e5e7eb'
        }}
        className="relative"
      >
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-2 border rounded-lg
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2
            ${!isValid ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'}
            ${isFocused ? 'border-blue-500' : 'border-gray-300'}
          `}
        />
        {error && !isValid && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1"
          >
            {error}
          </motion.p>
        )}
        {showRequirements && requirements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 p-3 bg-white border rounded-lg shadow-lg"
          >
            <ul className="text-sm text-gray-600 space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FormInput;