import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param {...string} inputs - Class names to be combined and merged
 * @returns {string} - Combined and merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a readable format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options 
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} - Truncated string with ellipsis if needed
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Formats a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generates a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID string
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Converts a string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title-cased string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Creates a URL-friendly slug from a string
 * @param {string} str - String to convert to slug
 * @returns {string} - URL-friendly slug
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Safely access nested object properties
 * @param {Object} obj - The object to query
 * @param {string} path - The path of the property to get
 * @param {*} defaultValue - The value returned for undefined resolved values
 * @returns {*} - The resolved value or default value
 */
export function get(obj, path, defaultValue = undefined) {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Creates a memoized version of a function
 * @param {Function} fn - Function to memoize
 * @returns {Function} - Memoized function
 */
export function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
