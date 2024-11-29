'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PasswordRequirementsProps {
  password: string;
  isVisible: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, isVisible }) => {
  // Define password requirements
  const requirements = [
    {
      text: 'At least 8 characters long',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      text: 'Contains at least one number',
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      text: 'Contains at least one special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
    {
      text: 'Contains at least one uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      text: 'Contains at least one lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
  ];

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for individual requirements
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      data-testid="password-requirements"
    >
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Password Requirements:
      </h4>
      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(password);
          return (
            <motion.div
              key={index}
              className="flex items-center space-x-2"
              variants={itemVariants}
            >
              <span
                className={`flex-shrink-0 h-5 w-5 ${
                  isMet ? 'text-green-500' : 'text-gray-300'
                }`}
              >
                {isMet ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm ${
                  isMet ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {requirement.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PasswordRequirements;