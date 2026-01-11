'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/session-store';
import { authenticateDevice, getActiveStores, api, getCurrentTenant } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Monitor } from 'lucide-react';
import type { StoreBrief } from '@/types';

export default function KioskSetupPage() {
  const router = useRouter();
  const { setDeviceSession, setTenant, setStore } = useSessionStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [stores, setStores] = useState<StoreBrief[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'device'>('credentials');

  // Validate credentials and fetch stores
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Try to authenticate to validate credentials
      const response = await authenticateDevice({
        email,
        password,
        deviceName: 'temp-validation',
      });

      // Set tenant ID for fetching stores
      api.setTenantId(response.device.tenantId);

      // Temporarily store the session so API calls work
      // This will be replaced with the real device name in handleDeviceSetup
      setDeviceSession(response.device, response.accessToken, response.refreshToken);

      // Fetch tenant info via protected endpoint
      try {
        const tenant = await getCurrentTenant();
        setTenant(tenant.slug, tenant);
      } catch {
        // Tenant fetch is optional
      }

      // Fetch available stores (now has auth token)
      const storeList = await getActiveStores();
      setStores(storeList);

      // If only one store, pre-select it
      if (storeList.length === 1) {
        setSelectedStoreId(storeList[0].id);
      }

      // Move to device setup step
      setStep('device');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Invalid credentials';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete device setup
  const handleDeviceSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authenticateDevice({
        email,
        password,
        deviceName,
        storeId: selectedStoreId || undefined,
      });

      // Set device session in store
      setDeviceSession(response.device, response.accessToken, response.refreshToken);

      // Set tenant ID for API calls
      api.setTenantId(response.device.tenantId);

      // Set store if selected
      if (selectedStoreId) {
        const selectedStore = stores.find(s => s.id === selectedStoreId);
        if (selectedStore) {
          setStore(selectedStore);
        }
      }

      // Navigate to store selection or menu
      if (selectedStoreId) {
        router.push(`/store/${selectedStoreId}/menu`);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to set up device';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Kiosk Setup</CardTitle>
          <CardDescription>
            {step === 'credentials'
              ? 'Enter your administrator credentials to set up this kiosk'
              : 'Configure your kiosk device'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleDeviceSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  type="text"
                  placeholder="Front Counter Kiosk"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name to identify this kiosk
                </p>
              </div>

              {stores.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="store">Assign to Store (Optional)</Label>
                  <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    If assigned, this kiosk will only serve this store
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('credentials')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || !deviceName}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
