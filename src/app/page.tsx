'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight, Store, AlertCircle } from 'lucide-react';
import { useSession } from '@/hooks';
import { useSessionStore } from '@/stores/session-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActiveStores, api } from '@/lib/api';
import type { StoreBrief } from '@/types';

export default function StoreSelectionPage() {
  const router = useRouter();
  const { tenant, isInitialized, isDeviceAuthenticated, deviceInfo } = useSession();
  const setStore = useSessionStore((state) => state.setStore);

  const [stores, setStores] = useState<StoreBrief[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isDeviceAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isDeviceAuthenticated, router]);

  // Redirect to menu if device is already bound to a store
  useEffect(() => {
    // Only redirect if we have valid authentication (tokens exist)
    const state = useSessionStore.getState();
    if (isInitialized && isDeviceAuthenticated && deviceInfo?.storeSlug && state.accessToken) {
      router.push(`/store/${deviceInfo.storeSlug}/menu`);
    }
  }, [isInitialized, isDeviceAuthenticated, deviceInfo, router]);

  // Fetch stores when authenticated and not bound to a store
  useEffect(() => {
    if (!isInitialized || !isDeviceAuthenticated || hasFetched) return;
    // Skip if device is bound to a store (will redirect above)
    if (deviceInfo?.storeId) return;
    // Ensure we have valid tokens before making API calls
    const state = useSessionStore.getState();
    if (!state.accessToken) return;

    const fetchStores = async () => {
      setIsLoadingStores(true);
      setError(null);
      try {
        // Ensure tenant ID is set for API calls
        if (deviceInfo?.tenantId) {
          api.setTenantId(deviceInfo.tenantId);
        }

        const data = await getActiveStores();
        setStores(data);
        setHasFetched(true);

        // If only one store, auto-select and navigate
        if (data.length === 1) {
          handleSelectStore(data[0]);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch stores:', err);
        // Check if it's an auth error - redirect to login
        if (err && typeof err === 'object' && 'status' in err) {
          const status = (err as { status: number }).status;
          if (status === 401 || status === 403) {
            router.push('/login');
            return;
          }
        }
        setError('Failed to load stores. Please try again.');
        setHasFetched(true);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, [isInitialized, isDeviceAuthenticated, deviceInfo, hasFetched]);

  const handleSelectStore = (storeData: StoreBrief) => {
    setStore(storeData);
    router.push(`/store/${storeData.slug}/menu`);
  };

  // Loading state
  if (!isInitialized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    );
  }

  // Not authenticated - will redirect to login
  if (!isDeviceAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  // Store selection
  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-8 text-center">
          {tenant?.settings?.logoUrl ? (
            <img
              src={tenant.settings.logoUrl}
              alt={tenant.name}
              className="h-16 w-auto object-contain mx-auto mb-4"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">
                {tenant?.name?.charAt(0) || deviceInfo?.tenantName?.charAt(0) || 'K'}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold">{tenant?.name || deviceInfo?.tenantName}</h1>
          <p className="text-muted-foreground mt-2">
            Select a location to start ordering
          </p>
        </div>
      </div>

      {/* Store List */}
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {isLoadingStores ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setHasFetched(false);
                  setError(null);
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : stores.length === 0 ? (
          // No stores available
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Stores Available</h2>
              <p className="text-muted-foreground mb-6">
                There are no active stores configured for this account yet.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">What to do next:</p>
                    <p>Please use the Manager App to create and configure your stores before using this kiosk.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {stores.map((storeItem) => (
              <Card
                key={storeItem.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectStore(storeItem)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{storeItem.name}</h3>
                      {storeItem.address && (
                        <p className="text-sm text-muted-foreground truncate">
                          {storeItem.address}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
