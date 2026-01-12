import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Tenant, Store, StoreBrief, TenantSettings, DeviceInfo } from '@/types';

interface SessionState {
  // Device session (kiosk authentication)
  deviceSessionId: string | null;
  deviceInfo: DeviceInfo | null;
  isDeviceAuthenticated: boolean;

  // Tenant (populated from device auth response)
  tenantSlug: string | null;
  tenant: Tenant | null;

  // Store (can be set from device auth or manually selected)
  selectedStoreId: string | null;
  selectedStore: StoreBrief | Store | null;

  // Auth tokens
  accessToken: string | null;
  refreshToken: string | null;

  // Status
  isInitialized: boolean;

  // Device Actions
  setDeviceSession: (deviceInfo: DeviceInfo, accessToken: string, refreshToken: string) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clearDeviceSession: () => void;

  // Tenant/Store Actions
  setTenant: (slug: string, tenant: Tenant) => void;
  setStore: (store: StoreBrief | Store) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;

  // Token accessors for API client
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

const initialState = {
  deviceSessionId: null,
  deviceInfo: null,
  isDeviceAuthenticated: false,
  tenantSlug: null,
  tenant: null,
  selectedStoreId: null,
  selectedStore: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDeviceSession: (deviceInfo, accessToken, refreshToken) => set({
        deviceSessionId: deviceInfo.sessionId,
        deviceInfo,
        isDeviceAuthenticated: true,
        accessToken,
        refreshToken,
        // Set store if device is bound to a specific store
        selectedStoreId: deviceInfo.storeId || null,
        // Create minimal store object from device info if bound
        selectedStore: deviceInfo.storeId && deviceInfo.storeName ? {
          id: deviceInfo.storeId,
          name: deviceInfo.storeName,
          code: '',  // Not available from device info
        } : null,
        // Mark as initialized since we just logged in
        isInitialized: true,
      }),

      updateTokens: (accessToken, refreshToken) => set({
        accessToken,
        refreshToken,
      }),

      clearDeviceSession: () => set({
        deviceSessionId: null,
        deviceInfo: null,
        isDeviceAuthenticated: false,
        accessToken: null,
        refreshToken: null,
      }),

      setTenant: (slug, tenant) => set({
        tenantSlug: slug,
        tenant,
      }),

      setStore: (store) => set({
        selectedStoreId: store.id,
        selectedStore: store,
      }),

      setInitialized: (initialized) => set({
        isInitialized: initialized,
      }),

      reset: () => set(initialState),

      // Token accessors
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'kiosk-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist device session data
        deviceSessionId: state.deviceSessionId,
        deviceInfo: state.deviceInfo,
        isDeviceAuthenticated: state.isDeviceAuthenticated,
        tenantSlug: state.tenantSlug,
        selectedStoreId: state.selectedStoreId,
        selectedStore: state.selectedStore,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Helper to get tenant settings with type safety
export function getTenantSettings(tenant: Tenant | null): TenantSettings {
  return tenant?.settings || {};
}

// Helper to check if device is authenticated
export function useIsDeviceAuthenticated(): boolean {
  return useSessionStore((state) => state.isDeviceAuthenticated);
}
