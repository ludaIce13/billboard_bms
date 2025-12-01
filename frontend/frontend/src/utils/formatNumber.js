/**
 * Format number with thousand separators (commas)
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '-';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '-';
  return number.toLocaleString('en-US');
};
