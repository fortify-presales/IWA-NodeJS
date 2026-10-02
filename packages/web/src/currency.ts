const storageKey = 'iwa.currency';

export const SUPPORTED_CURRENCIES = ['GBP', 'EUR', 'USD', 'CAD', 'AUD', 'JPY', 'INR'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const regionToCurrency: Record<string, SupportedCurrency> = {
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  IN: 'INR',
  IE: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR',
};

const languageToCurrency: Record<string, SupportedCurrency> = {
  en: 'GBP',
  de: 'EUR', fr: 'EUR', es: 'EUR', it: 'EUR', nl: 'EUR', pt: 'EUR', el: 'EUR',
  ja: 'JPY',
  hi: 'INR',
};

function isSupported(code: string | null | undefined): code is SupportedCurrency {
  return !!code && (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}

export function localeToCurrency(locale: string | undefined): SupportedCurrency | null {
  if (!locale) return null;
  const parts = locale.split('-');
  const region = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  return regionToCurrency[region] ?? languageToCurrency[parts[0].toLowerCase()] ?? null;
}

export function getStoredCurrency(): SupportedCurrency | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function setStoredCurrency(currency: string) {
  try {
    if (isSupported(currency)) window.localStorage.setItem(storageKey, currency);
  } catch {
    /* localStorage unavailable */
  }
}

/** Explicit choice wins, then the browser locale, then whatever the server advertises. */
export function resolvePreferredCurrency(serverCurrency?: string | null): string {
  return getStoredCurrency() ?? localeToCurrency(navigator.language) ?? serverCurrency ?? 'GBP';
}

export function formatMoney(amount: number | string, currency: string): string {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(navigator.language, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
