// API Error Handler Utility
export class APIError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

export const handleAPIError = (error) => {
  console.error('API Error:', error);

  // Network errors
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'network'
    };
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      if (data.details && Array.isArray(data.details)) {
        // Validation errors
        const fieldErrors = data.details.map(detail => 
          `${detail.field}: ${detail.message}`
        ).join(', ');
        return {
          message: `Validation error: ${fieldErrors}`,
          type: 'validation',
          details: data.details
        };
      }
      return {
        message: data.error || 'Invalid request',
        type: 'validation'
      };

    case 401:
      return {
        message: 'Please log in again to continue.',
        type: 'auth',
        shouldRedirect: '/login'
      };

    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        type: 'permission'
      };

    case 404:
      return {
        message: 'The requested resource was not found.',
        type: 'not_found'
      };

    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        type: 'rate_limit'
      };

    case 500:
      return {
        message: 'Server error. Please try again later.',
        type: 'server'
      };

    default:
      return {
        message: data.error || 'An unexpected error occurred.',
        type: 'unknown'
      };
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove dangerous characters
    .trim();
};

export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Player name is required');
  }
  
  const sanitized = sanitizeInput(name);
  
  if (sanitized.length === 0) {
    throw new Error('Player name cannot be empty');
  }
  
  if (sanitized.length > 50) {
    throw new Error('Player name must be 50 characters or less');
  }
  
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
    throw new Error('Player name can only contain letters, numbers, spaces, hyphens, and underscores');
  }
  
  return sanitized;
};

export const validateAmount = (amount) => {
  const num = Number(amount);
  
  if (isNaN(num)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (num < 0) {
    throw new Error('Amount cannot be negative');
  }
  
  if (num > 999999.99) {
    throw new Error('Amount cannot exceed 999,999.99');
  }
  
  return Math.round(num * 100) / 100;
}; 