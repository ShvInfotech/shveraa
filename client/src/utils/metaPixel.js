/**
 * Meta Pixel Standard E-Commerce Event Tracker
 * Safely dispatches standard events to Meta Pixel (window.fbq)
 */

export const trackPixelEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn(`[Meta Pixel] Error tracking ${eventName}:`, err);
    }
  }
};
