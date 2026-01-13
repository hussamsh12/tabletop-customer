'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, ChefHat, Package, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession, useIsKioskMode } from '@/hooks';
import { useTranslation } from '@/stores/translation-store';
import { getOrder } from '@/lib/api';
import type { OrderResponse, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { labelKey: string; fallback: string; icon: React.ElementType; color: string }> = {
  PENDING: { labelKey: 'order.status.pending', fallback: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  CONFIRMED: { labelKey: 'order.status.confirmed', fallback: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
  PREPARING: { labelKey: 'order.status.preparing', fallback: 'Preparing', icon: ChefHat, color: 'bg-orange-500' },
  READY: { labelKey: 'order.status.ready', fallback: 'Ready', icon: Package, color: 'bg-green-500' },
  COMPLETED: { labelKey: 'order.status.completed', fallback: 'Completed', icon: CheckCircle, color: 'bg-gray-500' },
  CANCELLED: { labelKey: 'order.status.cancelled', fallback: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { store } = useSession();
  const isKiosk = useIsKioskMode();
  const { t } = useTranslation();

  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(t('error.generic', 'Failed to load order details.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Handle new order
  const handleNewOrder = () => {
    router.push(`/store/${store?.slug}/menu`);
  };

  // Loading state
  if (isLoading && !order) {
    return (
      <div className="container px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Skeleton className="h-24 w-24 mx-auto rounded-full" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              {t('button.try_again', 'Try Again')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="pb-safe-area-bottom">
      <div className="container px-4 py-8 max-w-2xl mx-auto">
        {/* Order number and status */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center space-y-6">
            {/* Status icon */}
            <div className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center',
              status.color
            )}>
              <StatusIcon className="w-12 h-12 text-white" />
            </div>

            {/* Thank you message */}
            <div className="space-y-2">
              <h1 className={cn(
                'font-bold',
                isKiosk ? 'text-3xl' : 'text-2xl'
              )}>
                {t('order.thank_you', 'Thank you for your order!')}
              </h1>
              <p className="text-muted-foreground">
                {t('order.preparing_message', 'Your order is being prepared')}
              </p>
            </div>

            {/* Order number */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('order.number', 'Order Number')}</p>
              <p className={cn(
                'font-mono font-bold tracking-wider',
                isKiosk ? 'text-5xl' : 'text-4xl'
              )}>
                #{order.orderNumber}
              </p>
            </div>

            {/* Status badge */}
            <Badge
              variant="secondary"
              className={cn(
                'text-white px-4 py-2',
                status.color,
                isKiosk ? 'text-lg' : 'text-base'
              )}
            >
              {t(status.labelKey, status.fallback)}
            </Badge>
          </CardContent>
        </Card>

        {/* Order details */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className={cn(
              'font-semibold',
              isKiosk ? 'text-xl' : 'text-lg'
            )}>
              {t('checkout.order_summary', 'Order Summary')}
            </h2>

            {/* Store */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('store.label', 'Store')}</span>
              <span className="font-medium">{order.storeName}</span>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">
                        {item.quantity}x
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.itemName}</p>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}
                        {item.modifiers.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {item.modifiers.map(m => m.modifierName).join(', ')}
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
                  <span className="font-medium shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal', 'Subtotal')}</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.tax', 'Tax')}</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <Separator />
              <div className={cn(
                'flex justify-between font-bold',
                isKiosk ? 'text-xl' : 'text-lg'
              )}>
                <span>{t('cart.total', 'Total')}</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('item.special_instructions', 'Special Instructions')}</p>
                  <p className="italic">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          size={isKiosk ? 'lg' : 'default'}
          className={cn(
            'w-full touch-target',
            isKiosk && 'h-16 text-lg'
          )}
          onClick={handleNewOrder}
        >
          {t('button.new_order', 'New Order')}
        </Button>
      </div>
    </div>
  );
}
