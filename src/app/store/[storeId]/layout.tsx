'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks';
import { Header, CartSidebar } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;

  const { store, isInitialized, isDeviceAuthenticated, deviceInfo } = useSession();

  // Redirect if not authenticated or store doesn't match
  useEffect(() => {
    if (!isInitialized) return;

    // Must be authenticated
    if (!isDeviceAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if device is bound to a different store
    if (deviceInfo?.storeId && deviceInfo.storeId !== storeId) {
      router.push(`/store/${deviceInfo.storeId}/menu`);
      return;
    }

    // If no store selected or different store, go to store selection
    if (!store || store.id !== storeId) {
      router.push('/');
    }
  }, [isInitialized, isDeviceAuthenticated, deviceInfo, store, storeId, router]);

  // Loading state
  if (!isInitialized || !store) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header skeleton */}
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 container px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showStoreSelector />
      <main className="flex-1">{children}</main>
      <CartSidebar />
    </div>
  );
}
