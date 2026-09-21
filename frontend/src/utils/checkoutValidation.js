// Address, postal code, and contact verification logic for Azim Crafts Checkout
export const isGibberish = (str) => {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim().toLowerCase();
  if (s.length < 2) return true;
  
  // Repeated single character like "aaaaa", "11111", "......"
  if (/^(.)\1{2,}$/.test(s)) return true;
  
  // Common dummy / keyboard smash sequences
  const dummyWords = [
    'asdf', 'asdfgh', 'asdfghjkl', 'asdfghjk',
    'qwer', 'qwerty', 'qwertyuiop',
    'zxcv', 'zxcvbnm',
    '1234', '12345', '123456', '0000', '00000', '1111', '11111',
    'test', 'testing', 'fake', 'none', 'dummy', 'abc', 'abcd', 'xyz'
  ];
  if (dummyWords.includes(s)) return true;
  
  // Consonant clusters with no vowels in words longer than 4 chars (e.g. "ghjkl", "sdfg")
  const tokens = s.split(/\s+/);
  for (const t of tokens) {
    if (t.length >= 5 && !/[aeiouy0-9]/.test(t)) return true;
  }
  
  return false;
};

export const validatePostalCode = (postalCode, country) => {
  const c = (country || 'Australia').toLowerCase().trim();
  
  // Countries that do not use mandatory postal codes
  const noPostalCountries = [
    'united arab emirates', 'uae', 'qatar', 'bahrain', 'kuwait', 'oman', 
    'hong kong', 'fiji', 'yemen', 'uganda', 'seychelles', 'vanuatu', 
    'tuvalu', 'suriname', 'sao tome and principe', 'panama'
  ];
  const isNoPostalCountry = noPostalCountries.some(npc => c.includes(npc));

  if (!postalCode || typeof postalCode !== 'string' || !postalCode.trim()) {
    if (isNoPostalCountry) return null; // Optional for countries without postal systems
    return 'Postal code is required.';
  }
  const clean = postalCode.trim().toUpperCase();

  // Allow common international placeholders for areas without postal codes
  if (['00000', '0000', 'NA', 'N/A', 'NONE'].includes(clean)) {
    return null;
  }

  if (clean.length < 2) return 'Postal code is too short.';
  if (clean.length > 12) return 'Postal code is too long.';
  if (isGibberish(clean) && !isNoPostalCountry) return 'Please enter a valid postal code.';

  // United States: 5 digits or 5+4 (e.g. 90210 or 90210-1234)
  if (c.includes('united states') || c === 'us' || c === 'usa') {
    const usRegex = /^\d{5}(-\d{4})?$/;
    if (!usRegex.test(clean)) {
      return 'Please enter a valid 5-digit US ZIP code (e.g. 90210).';
    }
  }
  // Australia: exactly 4 digits (e.g. 3000, 2000, 4000)
  else if (c.includes('australia') || c === 'au') {
    const auRegex = /^\d{4}$/;
    if (!auRegex.test(clean)) {
      return 'Please enter a valid 4-digit Australian postcode (e.g. 3000).';
    }
  }
  // United Kingdom: alphanumeric UK postcode (e.g. SW1A 1AA, EC1A 1BB, M1 1AE)
  else if (c.includes('united kingdom') || c.includes('great britain') || c === 'uk' || c === 'gb') {
    const ukRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    if (!ukRegex.test(clean)) {
      return 'Please enter a valid UK postcode (e.g. SW1A 1AA).';
    }
  }
  // Canada: Canadian postal code A1A 1A1
  else if (c.includes('canada') || c === 'ca') {
    const caRegex = /^[A-CEGHJ-NPR-TV-Z]\d[A-CEGHJ-NPR-TV-Z]\s*\d[A-CEGHJ-NPR-TV-Z]\d$/i;
    if (!caRegex.test(clean)) {
      return 'Please enter a valid Canadian postal code (e.g. K1A 0B1).';
    }
  }
  // India: exactly 6 digits (e.g. 110001, 247667)
  else if (c.includes('india') || c === 'in') {
    const inRegex = /^[1-9]\d{5}$/;
    if (!inRegex.test(clean)) {
      return 'Please enter a valid 6-digit Indian PIN code (e.g. 110001).';
    }
  }
  // Germany, France, Italy, Spain, Mexico: 5 digits
  else if (['germany', 'france', 'italy', 'spain', 'mexico'].some(co => c.includes(co))) {
    const fiveDigit = /^\d{5}$/;
    if (!fiveDigit.test(clean)) {
      return 'Please enter a valid 5-digit postal code (e.g. 75001).';
    }
  }
  // Generic worldwide format: letters, numbers, spaces, hyphens
  else {
    if (!/^[A-Z0-9\s-]{2,10}$/i.test(clean)) {
      return 'Please enter a valid postal/ZIP code.';
    }
  }

  return null;
};

export const validateCheckoutAddress = (data) => {
  const errors = {};

  // 1. Email or Phone
  const emailOrPhone = (data.emailOrPhone || '').trim();
  if (!emailOrPhone) {
    errors.emailOrPhone = 'Email or mobile number is required.';
  } else if (emailOrPhone.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailOrPhone) || isGibberish(emailOrPhone.split('@')[0])) {
      errors.emailOrPhone = 'Please enter a valid email address (e.g. name@example.com).';
    }
  } else {
    const digitsOnly = emailOrPhone.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      errors.emailOrPhone = 'Please enter a valid mobile number (at least 8 digits) or email.';
    }
  }

  // 2. First Name
  const firstName = (data.firstName || '').trim();
  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s'-]+$/.test(firstName) || isGibberish(firstName)) {
    errors.firstName = 'Please enter a genuine first name without numbers or symbols.';
  }

  // 3. Last Name
  const lastName = (data.lastName || '').trim();
  if (!lastName) {
    errors.lastName = 'Last name is required.';
  } else if (lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s'-]+$/.test(lastName) || isGibberish(lastName)) {
    errors.lastName = 'Please enter a genuine last name without numbers or symbols.';
  }

  // 4. Street Address
  const address = (data.address || '').trim();
  if (!address) {
    errors.address = 'Street address is required.';
  } else if (address.length < 5) {
    errors.address = 'Street address is too short. Include house/flat number and street.';
  } else if (isGibberish(address)) {
    errors.address = 'Please enter a valid street address (e.g. 42 King Street).';
  } else if (!/\d/.test(address) && !/(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|way|boulevard|blvd|highway|hwy|apartment|apt|unit|suite|flat|house|block|building|floor|sector|phase|nagar|colony|mohalla|bypass|rue|via|calle|str|strasse|plaza|piazza|villa|plot|shop|tower|al)/i.test(address)) {
    errors.address = 'Please provide building/house number and street name (e.g. 42 King Street).';
  }

  // 5. City
  const city = (data.city || '').trim();
  if (!city) {
    errors.city = 'City / Suburb is required.';
  } else if (city.length < 2) {
    errors.city = 'City name is too short.';
  } else if (/^\d+$/.test(city) || isGibberish(city)) {
    errors.city = 'Please enter a valid city or suburb name.';
  }

  // 6. State / Region
  const state = (data.state || '').trim();
  if (!state) {
    errors.state = 'State / Region is required.';
  } else if (state.length < 2 || isGibberish(state)) {
    errors.state = 'Please enter a valid state or region.';
  }

  // 7. Postal / ZIP Code
  const postcodeError = validatePostalCode(data.postcode, data.country);
  if (postcodeError) {
    errors.postcode = postcodeError;
  }

  // 8. Contact Phone
  const phone = (data.phone || '').trim();
  if (!phone) {
    errors.phone = 'Phone number is required for DHL/FedEx shipping updates.';
  } else {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || /^(.)\1+$/.test(phoneDigits)) {
      errors.phone = 'Please enter a valid phone number (e.g. +61 400 000 000).';
    }
  }

  return errors;
};
