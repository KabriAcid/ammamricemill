/**
 * Format a number as currency with 2 decimal places and comma separators
 * Equivalent to PHP's number_format($value, 2)
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places and comma separators
 * @example
 * formatCurrency(150000) // "150,000.00"
 * formatCurrency(1234.5) // "1,234.50"
 * formatCurrency(0) // "0.00"
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const safeValue = isNaN(numValue) ? 0 : numValue;
  return safeValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a number with specified decimal places and comma separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with specified decimal places and comma separators
 * @example
 * formatNumber(1234.5678, 2) // "1,234.57"
 * formatNumber(1234.5678, 0) // "1,235"
 */
export const formatNumber = (
  value: number | string,
  decimals: number = 2
): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const safeValue = isNaN(numValue) ? 0 : numValue;
  return safeValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Parse a formatted currency string back to a number
 * @param value - The formatted string to parse
 * @returns The parsed number
 * @example
 * parseCurrency("150,000.00") // 150000
 * parseCurrency("1,234.50") // 1234.5
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/,/g, "")) || 0;
};
