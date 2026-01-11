import { useUIStore, type DisplayMode } from '@/stores/ui-store';

/**
 * Hook for display mode
 */
export function useDisplayMode(): DisplayMode {
  return useUIStore((state) => state.displayMode);
}

/**
 * Hook to check if in kiosk mode
 */
export function useIsKioskMode(): boolean {
  const mode = useDisplayMode();
  return mode === 'kiosk';
}

/**
 * Hook to check if in QR/mobile mode
 */
export function useIsQRMode(): boolean {
  const mode = useDisplayMode();
  return mode === 'qr';
}
