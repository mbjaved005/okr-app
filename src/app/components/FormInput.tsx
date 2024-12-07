"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  options?: string[];
  disabled?: boolean;
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
  requirements = [],
  options = [], // Default to empty array
  disabled,
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
      console.log(
        `FormInput: ${label} validation failed - required field is empty`
      );
      return false;
    }
    if (pattern && !new RegExp(pattern).test(value)) {
      console.log(`FormInput: ${label} validation failed - pattern mismatch`);
      return false;
    }
    if (minLength && value.length < minLength) {
      console.log(
        `FormInput: ${label} validation failed - minimum length not met`
      );
      return false;
    }
    if (maxLength && value.length > maxLength) {
      console.log(
        `FormInput: ${label} validation failed - maximum length exceeded`
      );
      return false;
    }
    console.log(`FormInput: ${label} validation passed`);
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (type === "date" && isNaN(Date.parse(e.target.value))) {
      return; // Prevent text input for date type
    }
    const newValue = e.target.value;
    const valid = validateInput(newValue);
    setIsValid(valid);
    onChange(newValue);
    console.log(`FormInput: ${label} value changed to ${newValue}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "date") {
      e.preventDefault(); // Prevent typing in date input
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (type === "password" && requirements.length > 0) {
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
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className={`w-full form-select px-4 py-2 border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${
            !isValid
              ? "border-red-500 focus:ring-red-200"
              : "focus:ring-blue-200"
          } ${isFocused ? "border-blue-500" : "border-gray-300"}`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <motion.div
          initial={false}
          animate={{
            scale: isFocused ? 1.01 : 1,
            borderColor: !isValid
              ? "#ef4444"
              : isFocused
              ? "#3b82f6"
              : "#e5e7eb",
            boxShadow: isFocused ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
          }}
          className="relative rounded-lg"
        >
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown} // Add onKeyDown handler
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            required={required}
            pattern={pattern}
            minLength={minLength}
            maxLength={maxLength}
            autoComplete={autoComplete}
            className={`shadow w-full px-4 py-2 border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${
              !isValid
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            } ${isFocused ? "border-blue-500" : "border-gray-300"}`}
            aria-label={label}
            disabled={disabled}
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
              className="absolute w-1/2 bg-gradient-to-r from-green-400 to-green-500 rounded-lg shadow-lg max-h-10 overflow-y-auto p-4"
            >
              <ul className="text-sm text-gray-600 space-y-2">
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
      )}
    </div>
  );
};

export default FormInput;
