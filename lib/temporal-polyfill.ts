// Load Temporal polyfill
if (typeof window !== 'undefined' && !('Temporal' in window)) {
  require('@js-temporal/polyfill');
}
