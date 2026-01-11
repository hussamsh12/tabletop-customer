import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartItemModifier } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  setTaxRate: (rate: number) => void;
}

// Generate a unique ID for cart items
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Calculate item total price
function calculateItemTotal(item: Pick<CartItem, 'unitPrice' | 'quantity' | 'modifiers'>): number {
  const modifiersTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
  return (item.unitPrice + modifiersTotal) * item.quantity;
}

// Recalculate cart totals
function recalculateTotals(items: CartItem[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      taxRate: 0.17, // Default 17% tax rate
      taxAmount: 0,
      total: 0,

      addItem: (itemData) => {
        const { items, taxRate } = get();

        // Check if same item with same variant and modifiers exists
        const existingIndex = items.findIndex(
          (existing) =>
            existing.itemId === itemData.itemId &&
            existing.variantId === itemData.variantId &&
            JSON.stringify(existing.modifiers.map(m => m.id).sort()) ===
            JSON.stringify(itemData.modifiers.map(m => m.id).sort())
        );

        let newItems: CartItem[];

        if (existingIndex >= 0) {
          // Update quantity of existing item
          newItems = items.map((item, index) => {
            if (index === existingIndex) {
              const newQuantity = item.quantity + itemData.quantity;
              return {
                ...item,
                quantity: newQuantity,
                totalPrice: calculateItemTotal({ ...item, quantity: newQuantity }),
              };
            }
            return item;
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            ...itemData,
            id: generateId(),
            totalPrice: calculateItemTotal(itemData),
          };
          newItems = [...items, newItem];
        }

        const totals = recalculateTotals(newItems, taxRate);
        set({ items: newItems, ...totals });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        const { items, taxRate } = get();
        const newItems = items.map((item) => {
          if (item.id === cartItemId) {
            return {
              ...item,
              quantity,
              totalPrice: calculateItemTotal({ ...item, quantity }),
            };
          }
          return item;
        });

        const totals = recalculateTotals(newItems, taxRate);
        set({ items: newItems, ...totals });
      },

      removeItem: (cartItemId) => {
        const { items, taxRate } = get();
        const newItems = items.filter((item) => item.id !== cartItemId);
        const totals = recalculateTotals(newItems, taxRate);
        set({ items: newItems, ...totals });
      },

      updateNotes: (cartItemId, notes) => {
        const { items } = get();
        const newItems = items.map((item) => {
          if (item.id === cartItemId) {
            return { ...item, notes };
          }
          return item;
        });
        set({ items: newItems });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          taxAmount: 0,
          total: 0,
        });
      },

      setTaxRate: (rate) => {
        const { items } = get();
        const totals = recalculateTotals(items, rate);
        set({ taxRate: rate, ...totals });
      },
    }),
    {
      name: 'kiosk-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        taxRate: state.taxRate,
      }),
    }
  )
);

// Selector hooks
export const useCartItemCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

export const useCartTotal = () =>
  useCartStore((state) => state.total);
