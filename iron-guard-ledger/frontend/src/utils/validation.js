// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

// Currency validation
export const isValidCurrency = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

// Quantity validation
export const isValidQuantity = (qty) => {
  const num = parseFloat(qty);
  return !isNaN(num) && num !== 0;
};

// Text validation (min/max length)
export const isValidText = (text, minLength = 1, maxLength = 255) => {
  if (!text) return false;
  return text.length >= minLength && text.length <= maxLength;
};

// Required fields validation
export const validateRequired = (fields) => {
  const errors = [];
  
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.push(`${key} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation helper
export const validateForm = (formData, schema) => {
  const errors = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const value = formData[field];

    if (rules.required && !value) {
      errors[field] = `${field} is required`;
      return;
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      return;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
      return;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} format is invalid`;
      return;
    }

    if (rules.custom && !rules.custom(value)) {
      errors[field] = rules.message || `${field} is invalid`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};