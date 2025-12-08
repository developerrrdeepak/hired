export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    
    console.log('Analytics Event:', event, properties);
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event, properties);
    }
    
    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
    }).catch(console.error);
  },

  page: (path: string) => {
    if (typeof window === 'undefined') return;
    
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: path,
      });
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    
    console.log('Analytics Identify:', userId, traits);
    
    if (window.gtag) {
      window.gtag('set', { user_id: userId, ...traits });
    }
  },
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
