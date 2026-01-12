'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, Store, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, useCartItemCount, useIsKioskMode } from '@/hooks';
import { useUIStore } from '@/stores/ui-store';
import { useSessionStore } from '@/stores/session-store';
import { useCartStore } from '@/stores/cart-store';

interface HeaderProps {
  onCartClick?: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const router = useRouter();
  const { tenant, store, deviceInfo } = useSession();
  const cartItemCount = useCartItemCount();
  const isKiosk = useIsKioskMode();
  const openCart = useUIStore((state) => state.openCart);
  const resetSession = useSessionStore((state) => state.reset);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      openCart();
    }
  };

  const handleLogout = () => {
    // Clear all local state
    clearCart();
    resetSession();
    // Redirect to login
    router.push('/login');
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

        {/* Right - Settings dropdown and Cart Button */}
        <div className="flex items-center gap-2">
          {/* Admin Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {deviceInfo?.deviceName || 'Kiosk'}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout & Reconfigure
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
