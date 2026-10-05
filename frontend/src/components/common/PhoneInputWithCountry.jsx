import React, { useState, useEffect } from 'react';
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY } from '../../data/countryDialCodes';

/**
 * Universal Phone Input with Country Code and Flag Selector
 * 
 * Automatically parses existing country dial code from value if provided,
 * or allows picking any country with its national flag.
 */
export function PhoneInputWithCountry({
  value = '',
  onChange,
  onCountryChange,
  countryCode,
  placeholder = 'Mobile number',
  required = false,
  className = '',
  inputClassName = '',
  disabled = false,
  name = 'phone',
  id,
  dataField,
  autoComplete = 'tel-national',
  hasError = false,
  onBlur,
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  // Find initial country based on countryCode prop or by parsing value
  const initialCountry = () => {
    if (countryCode) {
      const match = COUNTRY_DIAL_CODES.find(
        c => c.code.toUpperCase() === countryCode.toUpperCase() || c.name.toLowerCase() === countryCode.toLowerCase()
      );
      if (match) return match;
    }

    if (value && typeof value === 'string') {
      const clean = value.trim();
      if (clean.startsWith('+')) {
        // Try to match longest dial code first
        const sorted = [...COUNTRY_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
        const match = sorted.find(c => clean.startsWith(c.dial));
        if (match) return match;
      }
    }

    return DEFAULT_COUNTRY || COUNTRY_DIAL_CODES[0];
  };

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);

  // Sync if countryCode prop changes from outside
  useEffect(() => {
    if (countryCode) {
      const match = COUNTRY_DIAL_CODES.find(
        c => c.code.toUpperCase() === countryCode.toUpperCase() || c.name.toLowerCase() === countryCode.toLowerCase()
      );
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [countryCode]);

  // Strip dial code from display value if present
  const getDisplayPhone = () => {
    if (!value) return '';
    let str = String(value).trim();
    if (str.startsWith(selectedCountry.dial)) {
      str = str.slice(selectedCountry.dial.length).trim();
    }
    return str;
  };

  const handleCountryChange = (e) => {
    const nextCode = e.target.value;
    const found = COUNTRY_DIAL_CODES.find(c => c.code === nextCode);
    if (found) {
      setSelectedCountry(found);
      if (onCountryChange) onCountryChange(found);
      
      const currentRaw = getDisplayPhone();
      if (onChange) {
        const full = currentRaw ? `${found.dial} ${currentRaw}` : '';
        onChange(full, currentRaw, found);
      }
    }
  };

  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    // Remove duplicate country code if user accidentally typed it in input
    if (raw.startsWith(selectedCountry.dial)) {
      raw = raw.slice(selectedCountry.dial.length).trim();
    }

    if (onChange) {
      const full = raw.trim() ? `${selectedCountry.dial} ${raw.trim()}` : '';
      onChange(full, raw, selectedCountry);
    }
  };

  const pyClass = size === 'sm' ? 'py-1.5' : size === 'lg' ? 'py-3' : 'py-2.5';
  const textClass = size === 'sm' ? 'text-xs' : 'text-xs md:text-sm';

  return (
    <div
      className={`flex items-stretch border rounded-xl overflow-hidden transition-all bg-white ${
        hasError
          ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
          : 'border-neutral-300 focus-within:border-[#c8924b] focus-within:ring-2 focus-within:ring-[#c8924b]/20'
      } ${className}`}
    >
      {/* Country Flag & Dial Selector */}
      <div className="relative flex items-center bg-neutral-100/90 border-r border-neutral-300/80 shrink-0 hover:bg-neutral-200/70 transition-colors max-w-[125px] sm:max-w-[150px]">
        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          disabled={disabled}
          className={`w-full h-full ${pyClass} pl-2.5 pr-6 ${textClass} bg-transparent border-0 outline-none appearance-none cursor-pointer font-bold text-neutral-800 truncate`}
          aria-label="Country Dial Code"
          title={`${selectedCountry.name} (${selectedCountry.dial})`}
        >
          {COUNTRY_DIAL_CODES.map((c) => (
            <option key={c.code} value={c.code} className="bg-white text-neutral-900 font-sans">
              {c.flag} {c.dial} ({c.name})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-1.5 text-neutral-500 text-[10px] select-none">
          ▼
        </div>
      </div>

      {/* Mobile Number Input */}
      <input
        type="tel"
        name={name}
        id={id}
        data-field={dataField}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={getDisplayPhone()}
        onChange={handlePhoneChange}
        onBlur={onBlur}
        className={`w-full px-3.5 ${pyClass} ${textClass} border-0 focus:outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400 font-medium ${inputClassName}`}
      />
    </div>
  );
}
