'use client';

import { SessionProvider } from './session-provider';
import { BrandingProvider } from './branding-provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
  tenantSlug?: string;
}

export function Providers({ children, tenantSlug }: ProvidersProps) {
  return (
    <SessionProvider tenantSlug={tenantSlug}>
      <BrandingProvider>
        {children}
        <Toaster position="top-center" richColors />
      </BrandingProvider>
    </SessionProvider>
  );
}

export { SessionProvider } from './session-provider';
export { BrandingProvider } from './branding-provider';
