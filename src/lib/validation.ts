/**
 * Validation Library for QuickCourt
 * 
 * This module provides validation functions for API inputs without external dependencies.
 * For production, consider using a library like Zod or Joi for more robust validation.
 */

export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface BookingValidation {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  paymentMethod?: string;
}

export interface CourtValidation {
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingStartHour: number;
  operatingEndHour: number;
}

export interface FacilityValidation {
  name: string;
  address: string;
  city: string;
  venueType?: string;
  sports?: string[];
  amenities?: string[];
}

export interface ReviewValidation {
  rating: number;
  comment: string;
}

export interface ReportValidation {
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
}

/**
 * Validate booking input
 */
export function validateBooking(data: any): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.courtId || typeof data.courtId !== 'string') {
    errors.push('Court ID is required and must be a string');
  }

  if (!data.date || typeof data.date !== 'string') {
    errors.push('Date is required and must be a string');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  } else {
    // Validate date is not in the past
    const inputDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      errors.push('Date cannot be in the past');
    }
  }

  if (!data.startTime || typeof data.startTime !== 'string') {
    errors.push('Start time is required and must be a string');
  } else if (!/^\d{2}:\d{2}$/.test(data.startTime)) {
    errors.push('Start time must be in HH:MM format');
  }

  if (!data.endTime || typeof data.endTime !== 'string') {
    errors.push('End time is required and must be a string');
  } else if (!/^\d{2}:\d{2}$/.test(data.endTime)) {
    errors.push('End time must be in HH:MM format');
  }

  // Time validation
  if (data.startTime && data.endTime && /^\d{2}:\d{2}$/.test(data.startTime) && /^\d{2}:\d{2}$/.test(data.endTime)) {
    if (data.startTime >= data.endTime) {
      errors.push('Start time must be before end time');
    }

    // Validate time is within reasonable bounds (00:00 to 23:59)
    const startHour = parseInt(data.startTime.split(':')[0]);
    const endHour = parseInt(data.endTime.split(':')[0]);
    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      errors.push('Time must be between 00:00 and 23:59');
    }
  }

  // Payment method validation
  if (data.paymentMethod && !['UPI', 'CARD', 'NET_BANKING'].includes(data.paymentMethod)) {
    errors.push('Payment method must be one of: UPI, CARD, NET_BANKING');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: { ...data } };
}

/**
 * Validate court input
 */
export function validateCourt(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Court name is required');
  } else if (data.name.length > 100) {
    errors.push('Court name must be less than 100 characters');
  }

  if (!data.sportType || typeof data.sportType !== 'string') {
    errors.push('Sport type is required');
  } else {
    const validSports = ['Badminton', 'Box Cricket', 'Tennis', 'Pickleball', 'Football', 'Basketball'];
    if (!validSports.includes(data.sportType)) {
      errors.push(`Sport type must be one of: ${validSports.join(', ')}`);
    }
  }

  if (data.pricePerHour === undefined || data.pricePerHour === null) {
    errors.push('Price per hour is required');
  } else if (typeof data.pricePerHour !== 'number' || isNaN(data.pricePerHour)) {
    errors.push('Price per hour must be a valid number');
  } else if (data.pricePerHour < 0) {
    errors.push('Price per hour cannot be negative');
  } else if (data.pricePerHour > 100000) {
    errors.push('Price per hour is unreasonably high');
  }

  if (data.operatingStartHour === undefined || data.operatingStartHour === null) {
    errors.push('Operating start hour is required');
  } else if (typeof data.operatingStartHour !== 'number' || data.operatingStartHour < 0 || data.operatingStartHour > 23) {
    errors.push('Operating start hour must be between 0 and 23');
  }

  if (data.operatingEndHour === undefined || data.operatingEndHour === null) {
    errors.push('Operating end hour is required');
  } else if (typeof data.operatingEndHour !== 'number' || data.operatingEndHour < 0 || data.operatingEndHour > 23) {
    errors.push('Operating end hour must be between 0 and 23');
  }

  if (data.operatingStartHour !== undefined && data.operatingEndHour !== undefined) {
    if (data.operatingStartHour >= data.operatingEndHour) {
      errors.push('Operating start hour must be before end hour');
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: { ...data } };
}

/**
 * Validate facility input
 */
export function validateFacility(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Facility name is required');
  } else if (data.name.length > 200) {
    errors.push('Facility name must be less than 200 characters');
  }

  if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
    errors.push('Address is required');
  } else if (data.address.length > 500) {
    errors.push('Address must be less than 500 characters');
  }

  if (!data.city || typeof data.city !== 'string' || data.city.trim().length === 0) {
    errors.push('City is required');
  } else if (data.city.length > 100) {
    errors.push('City must be less than 100 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (data.venueType && data.venueType.length > 50) {
    errors.push('Venue type must be less than 50 characters');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: { ...data } };
}

/**
 * Validate review input
 */
export function validateReview(data: any): ValidationResult {
  const errors: string[] = [];

  if (data.rating === undefined || data.rating === null) {
    errors.push('Rating is required');
  } else if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }

  if (!data.comment || typeof data.comment !== 'string' || data.comment.trim().length === 0) {
    errors.push('Comment is required');
  } else if (data.comment.length > 1000) {
    errors.push('Comment must be less than 1000 characters');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: { ...data } };
}

/**
 * Validate report input
 */
export function validateReport(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.targetType || typeof data.targetType !== 'string') {
    errors.push('Target type is required');
  } else if (!['FACILITY', 'USER'].includes(data.targetType)) {
    errors.push('Target type must be either FACILITY or USER');
  }

  if (!data.targetId || typeof data.targetId !== 'string') {
    errors.push('Target ID is required');
  }

  if (!data.targetName || typeof data.targetName !== 'string' || data.targetName.trim().length === 0) {
    errors.push('Target name is required');
  }

  if (!data.reason || typeof data.reason !== 'string' || data.reason.trim().length === 0) {
    errors.push('Reason is required');
  } else if (data.reason.length > 500) {
    errors.push('Reason must be less than 500 characters');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data: { ...data } };
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { success: false, error: 'Phone number is required' };
  }

  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return { success: false, error: 'Invalid phone number format. Use international format (e.g., +919876543210)' };
  }

  return { success: true, data: phone };
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  if (email.length > 255) {
    return { success: false, error: 'Email is too long' };
  }

  return { success: true, data: email.toLowerCase().trim() };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { success: false, error: 'Password is too long' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { success: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { success: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { success: false, error: 'Password must contain at least one number' };
  }

  return { success: true, data: password };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: any, limit: any): ValidationResult {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per page

  if (pageNum < 1) {
    return { success: false, error: 'Page number must be at least 1' };
  }

  if (limitNum < 1) {
    return { success: false, error: 'Limit must be at least 1' };
  }

  return { success: true, data: { page: pageNum, limit: limitNum } };
}