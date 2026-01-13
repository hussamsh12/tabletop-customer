'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks';
import { useSessionStore } from '@/stores/session-store';
import { Header, CartSidebar } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { getStoreBySlug } from '@/lib/api';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  const { store, isInitialized, isDeviceAuthenticated, deviceInfo } = useSession();
  const setStore = useSessionStore((state) => state.setStore);

  // Check if the current store matches the slug
  const storeMatchesSlug = store?.slug === storeSlug;

  // Redirect if not authenticated or load store by slug
  useEffect(() => {
    if (!isInitialized) return;

    // Check for valid tokens (not just isDeviceAuthenticated flag)
    const state = useSessionStore.getState();
    const hasValidTokens = state.accessToken && state.isDeviceAuthenticated;

    // Must be authenticated with valid tokens
    if (!hasValidTokens) {
      router.push('/login');
      return;
    }

    // If store already matches slug, we're good
    if (storeMatchesSlug) {
      return;
    }

    // Load store by slug
    const loadStore = async () => {
      setIsLoadingStore(true);
      try {
        const storeData = await getStoreBySlug(storeSlug);
        setStore(storeData);
      } catch (err: unknown) {
        console.error('Failed to load store by slug:', err);
        // Check if it's an auth error - redirect to login
        if (err && typeof err === 'object' && 'status' in err) {
          const status = (err as { status: number }).status;
          if (status === 401 || status === 403) {
            router.push('/login');
            return;
          }
        }
        // Other errors - redirect to store selection
        router.push('/');
      } finally {
        setIsLoadingStore(false);
      }
    };

    loadStore();
  }, [isInitialized, isDeviceAuthenticated, storeSlug, storeMatchesSlug, router, setStore]);

  // Loading state
  if (!isInitialized || isLoadingStore || !storeMatchesSlug) {
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
      <Header />
      <main className="flex-1">{children}</main>
      <CartSidebar />
    </div>
  );
}
