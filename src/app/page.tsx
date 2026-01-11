'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight } from 'lucide-react';
import { useSession } from '@/hooks';
import { useSessionStore } from '@/stores/session-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActiveStores, api } from '@/lib/api';
import type { StoreBrief } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { tenant, store, isInitialized, isDeviceAuthenticated, deviceInfo } = useSession();
  const setStore = useSessionStore((state) => state.setStore);

  const [stores, setStores] = useState<StoreBrief[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to setup if not authenticated
  useEffect(() => {
    if (isInitialized && !isDeviceAuthenticated) {
      router.push('/setup');
    }
  }, [isInitialized, isDeviceAuthenticated, router]);

  // Redirect to menu if store is already selected or device is bound to a store
  useEffect(() => {
    if (!isInitialized || !isDeviceAuthenticated) return;

    // Device is bound to a specific store
    if (deviceInfo?.storeId) {
      router.push(`/store/${deviceInfo.storeId}/menu`);
      return;
    }

    // Store is already selected
    if (store) {
      router.push(`/store/${store.id}/menu`);
    }
  }, [isInitialized, isDeviceAuthenticated, deviceInfo, store, router]);

  // Fetch stores when authenticated
  useEffect(() => {
    if (!isInitialized || !isDeviceAuthenticated) return;
    if (store || deviceInfo?.storeId) return; // Will redirect

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

        // If only one store, auto-select it
        if (data.length === 1) {
          handleSelectStore(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch stores:', err);
        setError('Failed to load stores. Please try again.');
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, [isInitialized, isDeviceAuthenticated, store, deviceInfo]);

  const handleSelectStore = (storeData: StoreBrief) => {
    setStore(storeData);
    router.push(`/store/${storeData.id}/menu`);
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

  // Not authenticated - will redirect to setup
  if (!isDeviceAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Redirecting to setup...</p>
        </div>
      </main>
    );
  }

  // Redirect in progress
  if (store || deviceInfo?.storeId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
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
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No stores available at the moment.
              </p>
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
