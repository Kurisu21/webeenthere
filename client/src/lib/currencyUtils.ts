// lib/currencyUtils.ts
// Currency conversion utilities for displaying prices in PHP while processing in USD

// Exchange rate: 1 USD = 55.5 PHP (approximate rate, can be updated)
const USD_TO_PHP_RATE = 55.5;

/**
 * Convert USD to PHP for display purposes
 * @param usdAmount - Amount in USD
 * @returns Amount in PHP
 */
export function usdToPhp(usdAmount: number): number {
  return usdAmount * USD_TO_PHP_RATE;
}

/**
 * Format price in PHP for display
 * @param usdPrice - Price in USD (from database/API)
 * @param period - 'month' | 'year' | null
 * @returns Formatted string like "₱119.33/month"
 */
export function formatPriceInPhp(usdPrice: number, period: 'month' | 'year' | null = null): string {
  if (usdPrice === 0) return 'Free';
  
  const phpPrice = usdToPhp(usdPrice);
  const formattedPrice = phpPrice.toFixed(2);
  
  if (period === 'month') {
    return `₱${formattedPrice}/month`;
  } else if (period === 'year') {
    return `₱${formattedPrice}/year`;
  }
  
  return `₱${formattedPrice}`;
}

/**
 * Format currency in PHP (for amounts without period)
 * @param usdAmount - Amount in USD
 * @returns Formatted string like "₱119.33"
 */
export function formatCurrencyInPhp(usdAmount: number): string {
  const phpAmount = usdToPhp(usdAmount);
  return `₱${phpAmount.toFixed(2)}`;
}

/**
 * Get the USD amount (for processing - database/Stripe always uses USD)
 * @param usdPrice - Price in USD (already in USD, just returns as-is)
 * @returns Same USD amount (for clarity in code)
 */
export function getUsdAmount(usdPrice: number): number {
  return usdPrice;
}
