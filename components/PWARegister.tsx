"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Delay registration to avoid blocking initial render
      setTimeout(() => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            // Silently fail - service worker is optional
            console.warn('Service Worker registration failed (non-critical):', error);
          });
      }, 1000);
    }
  }, []);

  return null;
}

