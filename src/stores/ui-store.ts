import { create } from 'zustand';

export type DisplayMode = 'kiosk' | 'qr';

interface UIState {
  // Display mode
  displayMode: DisplayMode;

  // Navigation
  selectedCategoryId: string | null;

  // Item detail modal
  isItemModalOpen: boolean;
  selectedItemId: string | null;

  // Cart sidebar (for desktop/kiosk)
  isCartOpen: boolean;

  // Loading states
  isLoading: boolean;

  // Actions
  setDisplayMode: (mode: DisplayMode) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  openItemModal: (itemId: string) => void;
  closeItemModal: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
}

// Detect display mode based on screen size and user agent
function detectDisplayMode(): DisplayMode {
  if (typeof window === 'undefined') return 'kiosk';

  // Check URL parameter first (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  if (modeParam === 'qr' || modeParam === 'kiosk') {
    return modeParam;
  }

  // Check screen width - tablets are typically >= 768px
  const isTablet = window.innerWidth >= 768;

  // Check user agent for mobile devices
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isPhone = isMobile && window.innerWidth < 768;

  // QR mode for phones, Kiosk mode for tablets and larger
  return isPhone ? 'qr' : 'kiosk';
}

export const useUIStore = create<UIState>()((set, get) => ({
  displayMode: 'kiosk', // Default, will be updated on mount
  selectedCategoryId: null,
  isItemModalOpen: false,
  selectedItemId: null,
  isCartOpen: false,
  isLoading: false,

  setDisplayMode: (mode) => set({ displayMode: mode }),

  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

  openItemModal: (itemId) => set({
    isItemModalOpen: true,
    selectedItemId: itemId,
  }),

  closeItemModal: () => set({
    isItemModalOpen: false,
    selectedItemId: null,
  }),

  openCart: () => set({ isCartOpen: true }),

  closeCart: () => set({ isCartOpen: false }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// Export detector for use in providers
export { detectDisplayMode };
