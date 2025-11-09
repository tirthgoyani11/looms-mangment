/**
 * Firebase Helper Functions
 * 
 * @description Helper functions and path utilities for Firebase Looms App
 * @author Firebase Looms Team
 * @version 1.0.0
 */

// Constants inline to avoid config dependencies
const APP_ID = 'looms-app';
const COLLECTION_PATHS = {
  ARTIFACTS: 'artifacts',
  PUBLIC: 'public',
  DATA: 'data',
  USERS: 'users'
};

/**
 * Generate public collection path
 * @param {string} coll - Collection name
 * @returns {string} Complete path to the public collection
 */
export const publicPath = (coll) => {
  if (!coll) {
    throw new Error('Collection name is required');
  }
  return `${COLLECTION_PATHS.ARTIFACTS}/${APP_ID}/${COLLECTION_PATHS.PUBLIC}/${COLLECTION_PATHS.DATA}/${coll}`;
};

/**
 * Generate users collection path
 * @returns {string} Complete path to the users collection
 */
export const usersPath = () => {
  return `${COLLECTION_PATHS.ARTIFACTS}/${APP_ID}/${COLLECTION_PATHS.PUBLIC}/${COLLECTION_PATHS.DATA}/${COLLECTION_PATHS.USERS}`;
};

/**
 * Path utilities object
 */
export const pathUtils = {
  /**
   * Get public path for a collection
   * @param {string} collection - Collection name
   * @returns {string} Public collection path
   */
  getPublicPath: publicPath,
  
  /**
   * Get users path
   * @returns {string} Users collection path
   */
  getUsersPath: usersPath,
  
  /**
   * Generate custom path
   * @param {string[]} segments - Path segments
   * @returns {string} Complete path
   */
  buildPath: (...segments) => {
    return segments.filter(segment => segment).join('/');
  },
  
  /**
   * Validate collection name
   * @param {string} name - Collection name to validate
   * @returns {boolean} True if valid
   */
  isValidCollectionName: (name) => {
    return typeof name === 'string' && name.length > 0 && !/[/\s]/.test(name);
  }
};

/**
 * Common helper functions
 */
export const helpers = {
  /**
   * Check if value is empty
   * @param {any} value - Value to check
   * @returns {boolean} True if empty
   */
  isEmpty: (value) => {
    return value === null || value === undefined || value === '';
  },
  
  /**
   * Generate unique ID
   * @returns {string} Unique identifier
   */
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  /**
   * Format timestamp
   * @param {Date|number} timestamp - Timestamp to format
   * @returns {string} Formatted timestamp
   */
  formatTimestamp: (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toISOString();
  }
};
