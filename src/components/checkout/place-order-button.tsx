'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useSessionStore } from '@/stores/session-store';
import { useUIStore } from '@/stores/ui-store';
import { useIsKioskMode } from '@/hooks';
import { createOrder } from '@/lib/api';
import { toast } from 'sonner';
import type { CreateOrderRequest, OrderItemRequest } from '@/types';

interface PlaceOrderButtonProps {
  notes: string;
  disabled?: boolean;
}

export function PlaceOrderButton({ notes, disabled }: PlaceOrderButtonProps) {
  const router = useRouter();
  const isKiosk = useIsKioskMode();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  const selectedStoreId = useSessionStore((state) => state.selectedStoreId);
  const displayMode = useUIStore((state) => state.displayMode);

  const handlePlaceOrder = async () => {
    if (!selectedStoreId || items.length === 0) {
      toast.error('Unable to place order. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert cart items to order items
      const orderItems: OrderItemRequest[] = items.map((item) => ({
        itemId: item.itemId,
        variantId: item.variantId,
        quantity: item.quantity,
        notes: item.notes,
        modifierIds: item.modifiers.map((m) => m.id),
      }));

      // Create order request
      const request: CreateOrderRequest = {
        storeId: selectedStoreId,
        source: displayMode === 'kiosk' ? 'KIOSK' : 'QR_TABLE',
        items: orderItems,
        notes: notes || undefined,
      };

      // Submit order
      const order = await createOrder(request);

      // Clear cart
      clearCart();

      // Show success
      toast.success('Order placed successfully!');

      // Navigate to confirmation
      router.push(`/store/${selectedStoreId}/order/${order.id}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      size={isKiosk ? 'lg' : 'default'}
      className={cn(
        'w-full touch-target',
        isKiosk && 'h-16 text-lg'
      )}
      disabled={disabled || isSubmitting || items.length === 0}
      onClick={handlePlaceOrder}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Placing Order...
        </>
      ) : (
        `Place Order - ${formatCurrency(total)}`
      )}
    </Button>
  );
}
