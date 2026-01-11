'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useIsKioskMode } from '@/hooks';
import { Separator } from '@/components/ui/separator';

export function OrderSummary() {
  const isKiosk = useIsKioskMode();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const taxAmount = useCartStore((state) => state.taxAmount);
  const total = useCartStore((state) => state.total);

  return (
    <div className="space-y-4">
      <h3 className={cn(
        'font-semibold',
        isKiosk ? 'text-xl' : 'text-lg'
      )}>
        Order Summary
      </h3>

      {/* Item list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <span className={cn(
                  'font-medium text-muted-foreground',
                  isKiosk && 'text-lg'
                )}>
                  {item.quantity}x
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'font-medium truncate',
                    isKiosk && 'text-lg'
                  )}>
                    {item.itemName}
                  </p>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">
                      {item.variantName}
                    </p>
                  )}
                  {item.modifiers.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {item.modifiers.map(m => m.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <span className={cn(
              'font-medium shrink-0',
              isKiosk && 'text-lg'
            )}>
              {formatCurrency(item.totalPrice)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <Separator />
        <div className={cn(
          'flex justify-between font-bold',
          isKiosk ? 'text-xl' : 'text-lg'
        )}>
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
