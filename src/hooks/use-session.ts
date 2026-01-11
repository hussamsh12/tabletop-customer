import { useSessionStore } from '@/stores/session-store';

/**
 * Convenience hook for session data
 */
export function useSession() {
  const tenant = useSessionStore((state) => state.tenant);
  const store = useSessionStore((state) => state.selectedStore);
  const deviceInfo = useSessionStore((state) => state.deviceInfo);
  const isDeviceAuthenticated = useSessionStore((state) => state.isDeviceAuthenticated);
  const isInitialized = useSessionStore((state) => state.isInitialized);

  return {
    tenant,
    store,
    deviceInfo,
    isDeviceAuthenticated,
    isInitialized,
    hasStore: !!store,
    hasTenant: !!tenant,
  };
}

/**
 * Hook to check if kiosk is authenticated and ready
 */
export function useIsKioskReady() {
  const isDeviceAuthenticated = useSessionStore((state) => state.isDeviceAuthenticated);
  const isInitialized = useSessionStore((state) => state.isInitialized);
  return isInitialized && isDeviceAuthenticated;
}

/**
 * Hook to check if session is ready for ordering
 */
export function useCanOrder() {
  const { hasTenant, hasStore, isDeviceAuthenticated, isInitialized } = useSession();
  return isInitialized && isDeviceAuthenticated && hasTenant && hasStore;
}
