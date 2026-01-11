'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { api, setTokenStore, getCurrentTenant } from '@/lib/api';

interface SessionProviderProps {
  children: React.ReactNode;
  tenantSlug?: string; // From middleware/server component
}

export function SessionProvider({ children, tenantSlug }: SessionProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    tenantSlug: storedTenantSlug,
    deviceInfo,
    isDeviceAuthenticated,
    setTenant,
    setInitialized,
    getAccessToken,
    getRefreshToken,
    updateTokens,
    clearDeviceSession,
  } = useSessionStore();

  // Setup token store for API client
  useEffect(() => {
    setTokenStore({
      getAccessToken,
      getRefreshToken,
      setTokens: updateTokens,
      clearTokens: clearDeviceSession,
      // Read directly from store to avoid stale closure
      isDeviceSession: () => useSessionStore.getState().isDeviceAuthenticated,
    });
  }, [getAccessToken, getRefreshToken, updateTokens, clearDeviceSession]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize session
  useEffect(() => {
    if (!isHydrated) return;

    const initSession = async () => {
      try {
        // If device is already authenticated, set tenant from device info
        if (isDeviceAuthenticated && deviceInfo) {
          api.setTenantId(deviceInfo.tenantId);

          // Fetch full tenant info via protected endpoint
          try {
            const tenant = await getCurrentTenant();
            // Use provided slug or stored slug, falling back to tenant's own slug
            const slugToUse = tenantSlug || storedTenantSlug || tenant.slug;
            setTenant(slugToUse, tenant);
          } catch (error) {
            console.warn('Failed to fetch tenant info:', error);
          }

          setInitialized(true);
          return;
        }

        // Not authenticated - will redirect to setup
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setInitialized(true);
      }
    };

    initSession();
  }, [
    isHydrated,
    tenantSlug,
    storedTenantSlug,
    deviceInfo,
    isDeviceAuthenticated,
    setTenant,
    setInitialized,
  ]);

  // Show nothing until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
