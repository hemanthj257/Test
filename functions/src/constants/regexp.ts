/**
 * @description At least one special char, one lowercase, one uppercase, one number
 */
export const REGEXP_PASSWORD = /^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

/**
 * @description YYYY-MM-DD HH:MM:SS+HH:MM
 */
export const REGEXP_DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
