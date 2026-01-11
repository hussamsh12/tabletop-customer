'use client';

import { ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession, useCartItemCount, useIsKioskMode } from '@/hooks';
import { useUIStore } from '@/stores/ui-store';

interface HeaderProps {
  onCartClick?: () => void;
  showStoreSelector?: boolean;
}

export function Header({ onCartClick, showStoreSelector = false }: HeaderProps) {
  const { tenant, store } = useSession();
  const cartItemCount = useCartItemCount();
  const isKiosk = useIsKioskMode();
  const openCart = useUIStore((state) => state.openCart);

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      openCart();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo / Tenant Name */}
        <div className="flex items-center gap-3">
          {tenant?.settings?.logoUrl ? (
            <img
              src={tenant.settings.logoUrl}
              alt={tenant.name}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {tenant?.name?.charAt(0) || 'K'}
                </span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">
                {tenant?.name || 'Kiosk-IT'}
              </span>
            </div>
          )}
        </div>

        {/* Center - Store Name (if selected) */}
        {store && (
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">{store.name}</span>
          </div>
        )}

        {/* Right - Cart Button */}
        <div className="flex items-center gap-2">
          {showStoreSelector && store && (
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Store className="h-4 w-4 mr-2" />
              Change Store
            </Button>
          )}

          <Button
            variant="outline"
            size={isKiosk ? 'lg' : 'default'}
            className="relative touch-target"
            onClick={handleCartClick}
          >
            <ShoppingCart className={isKiosk ? 'h-6 w-6' : 'h-5 w-5'} />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
            <span className="ml-2 hidden sm:inline">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
