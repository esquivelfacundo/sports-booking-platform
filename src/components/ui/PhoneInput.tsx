'use client';

import React, { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Número de teléfono",
  className = "",
  error
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the value for display
    if (value) {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      // If it starts with 54, format as Argentine number
      if (digits.startsWith('54')) {
        const number = digits.slice(2); // Remove country code
        if (number.length >= 10) {
          // Format: +54 9 11 1234-5678
          const areaCode = number.slice(1, 3);
          const firstPart = number.slice(3, 7);
          const secondPart = number.slice(7, 11);
          setDisplayValue(`+54 9 ${areaCode} ${firstPart}-${secondPart}`);
        } else if (number.length > 1) {
          // Partial formatting
          const areaCode = number.slice(1, 3);
          const rest = number.slice(3);
          setDisplayValue(`+54 9 ${areaCode} ${rest}`);
        } else {
          setDisplayValue(`+54 9 ${number}`);
        }
      } else if (digits.length > 0) {
        // If doesn't start with 54, add it
        const number = digits;
        if (number.length >= 10) {
          const areaCode = number.slice(0, 2);
          const firstPart = number.slice(2, 6);
          const secondPart = number.slice(6, 10);
          setDisplayValue(`+54 9 ${areaCode} ${firstPart}-${secondPart}`);
        } else if (number.length > 0) {
          const areaCode = number.slice(0, 2);
          const rest = number.slice(2);
          setDisplayValue(`+54 9 ${areaCode} ${rest}`);
        }
      } else {
        setDisplayValue('+54 9 ');
      }
    } else {
      setDisplayValue('+54 9 ');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // If user tries to delete the prefix, restore it
    if (input.length < 6) {
      return;
    }

    // Extract only digits after +54 9
    const digitsOnly = input.replace(/^\+54 9\s*/, '').replace(/\D/g, '');
    
    // Limit to 10 digits (Argentine mobile format)
    if (digitsOnly.length <= 10) {
      // Store the clean format for the backend
      const cleanValue = digitsOnly.length > 0 ? `54${digitsOnly}` : '';
      onChange(cleanValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Set cursor position after +54 9
    setTimeout(() => {
      const input = e.target;
      const prefixLength = '+54 9 '.length;
      const pos = Math.max(prefixLength, input.value.length);
      input.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;
    const prefixLength = '+54 9 '.length;
    
    // Prevent deletion of the prefix
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= prefixLength) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        autoComplete="tel"
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhoneInput;
