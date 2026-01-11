'use client';

import { useEffect, useState, useRef } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { api, setTokenStore, getCurrentTenant } from '@/lib/api';

interface SessionProviderProps {
  children: React.ReactNode;
  tenantSlug?: string; // From middleware/server component
}

export function SessionProvider({ children, tenantSlug }: SessionProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitialized = useRef(false);

  const {
    tenantSlug: storedTenantSlug,
    deviceInfo,
    isDeviceAuthenticated,
    setTenant,
    setInitialized,
    updateTokens,
    clearDeviceSession,
  } = useSessionStore();

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Setup token store for API client
  useEffect(() => {
    if (!isHydrated) return;

    setTokenStore({
      getAccessToken: () => useSessionStore.getState().accessToken,
      getRefreshToken: () => useSessionStore.getState().refreshToken,
      setTokens: updateTokens,
      clearTokens: clearDeviceSession,
      isDeviceSession: () => useSessionStore.getState().isDeviceAuthenticated,
    });
  }, [isHydrated, updateTokens, clearDeviceSession]);

  // Initialize session (only once after hydration)
  useEffect(() => {
    if (!isHydrated || hasInitialized.current) return;
    hasInitialized.current = true;

    const initSession = async () => {
      // Read directly from store state to get latest hydrated values
      const state = useSessionStore.getState();
      const { isDeviceAuthenticated: isAuth, deviceInfo: device, accessToken } = state;

      console.log('[SessionProvider] initSession', {
        isAuth,
        hasDevice: !!device,
        hasToken: !!accessToken,
      });

      try {
        // If device is already authenticated, set tenant from device info
        if (isAuth && device && accessToken) {
          console.log('[SessionProvider] Device authenticated, fetching tenant');
          api.setTenantId(device.tenantId);

          // Fetch full tenant info via protected endpoint
          try {
            const tenant = await getCurrentTenant();
            const slugToUse = tenantSlug || storedTenantSlug || tenant.slug;
            setTenant(slugToUse, tenant);
            console.log('[SessionProvider] Tenant fetched successfully');
          } catch (error) {
            console.warn('[SessionProvider] Failed to fetch tenant:', error);
            // If 401/403, clear session and force re-auth
            if (error && typeof error === 'object' && 'status' in error) {
              const status = (error as { status: number }).status;
              if (status === 401 || status === 403) {
                console.log('[SessionProvider] Auth invalid, clearing session');
                clearDeviceSession();
              }
            }
          }

          setInitialized(true);
          return;
        }

        // Not authenticated - will redirect to setup
        console.log('[SessionProvider] Not authenticated');
        setInitialized(true);
      } catch (error) {
        console.error('[SessionProvider] Init error:', error);
        setInitialized(true);
      }
    };

    initSession();
  }, [isHydrated, tenantSlug, storedTenantSlug, setTenant, setInitialized, clearDeviceSession]);

  // Show nothing until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
