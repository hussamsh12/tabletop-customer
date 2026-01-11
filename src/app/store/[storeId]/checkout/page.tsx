'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckoutForm, OrderSummary, PlaceOrderButton } from '@/components/checkout';
import { useSession, useIsKioskMode } from '@/hooks';
import { useCartStore } from '@/stores/cart-store';

export default function CheckoutPage() {
  const router = useRouter();
  const { store, isInitialized } = useSession();
  const isKiosk = useIsKioskMode();
  const items = useCartStore((state) => state.items);
  const [orderNotes, setOrderNotes] = useState('');

  // Redirect to menu if cart is empty
  if (isInitialized && items.length === 0) {
    return (
      <div className="container px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className={cn(
              'font-semibold',
              isKiosk ? 'text-2xl' : 'text-xl'
            )}>
              Your cart is empty
            </h2>
            <p className="text-muted-foreground">
              Add some items to your cart before checking out.
            </p>
            <Button
              size={isKiosk ? 'lg' : 'default'}
              onClick={() => router.push(`/store/${store?.id}/menu`)}
            >
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-bottom">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="container px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="touch-target"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className={cn(
            'font-semibold',
            isKiosk ? 'text-2xl' : 'text-xl'
          )}>
            Checkout
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <div className={cn(
          'grid gap-6',
          isKiosk ? 'lg:grid-cols-2' : 'grid-cols-1'
        )}>
          {/* Left column - Order details */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <CheckoutForm
                  notes={orderNotes}
                  onNotesChange={setOrderNotes}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <OrderSummary />
              </CardContent>
            </Card>

            <PlaceOrderButton notes={orderNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
