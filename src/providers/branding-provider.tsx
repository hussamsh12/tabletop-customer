'use client';

import { useEffect } from 'react';
import { useSessionStore, getTenantSettings } from '@/stores/session-store';
import { useUIStore, type DisplayMode } from '@/stores/ui-store';

/**
 * Convert hex color to oklch format (simplified approximation)
 * For production, consider using a proper color conversion library
 */
function hexToOklch(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Simple approximation - for accurate conversion use a library like culori
  // This gives a reasonable approximation for most colors
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const c = Math.sqrt(
    Math.pow(r - l, 2) + Math.pow(g - l, 2) + Math.pow(b - l, 2)
  ) * 0.4;
  const h = Math.atan2(b - l, r - l) * (180 / Math.PI);

  return `oklch(${(l * 0.8 + 0.2).toFixed(3)} ${c.toFixed(3)} ${((h + 360) % 360).toFixed(1)})`;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const tenant = useSessionStore((state) => state.tenant);
  const displayMode = useUIStore((state) => state.displayMode);

  useEffect(() => {
    const settings = getTenantSettings(tenant);
    const root = document.documentElement;

    // Apply primary color
    if (settings.primaryColor) {
      const primary = hexToOklch(settings.primaryColor);
      root.style.setProperty('--primary', primary);
      // Generate foreground based on luminance
      root.style.setProperty('--primary-foreground', 'oklch(0.985 0 0)');
    }

    // Apply secondary color
    if (settings.secondaryColor) {
      const secondary = hexToOklch(settings.secondaryColor);
      root.style.setProperty('--secondary', secondary);
    }

    // Apply font family
    if (settings.fontFamily) {
      root.style.setProperty('--font-sans', settings.fontFamily);
    }

    // Set display mode data attribute for CSS targeting
    root.setAttribute('data-mode', displayMode);

    // Cleanup on unmount
    return () => {
      root.removeAttribute('data-mode');
    };
  }, [tenant, displayMode]);

  return <>{children}</>;
}

/**
 * Custom CSS for display modes
 * Add to globals.css:
 *
 * [data-mode="kiosk"] {
 *   --touch-target-min: 64px;
 *   font-size: 18px;
 * }
 *
 * [data-mode="qr"] {
 *   --touch-target-min: 44px;
 *   font-size: 16px;
 * }
 */
