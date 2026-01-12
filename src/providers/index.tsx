'use client';

import { SessionProvider } from './session-provider';
import { BrandingProvider } from './branding-provider';
import { TranslationProvider } from './translation-provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
  tenantSlug?: string;
}

export function Providers({ children, tenantSlug }: ProvidersProps) {
  return (
    <SessionProvider tenantSlug={tenantSlug}>
      <BrandingProvider>
        <TranslationProvider>
          {children}
          <Toaster position="top-center" richColors />
        </TranslationProvider>
      </BrandingProvider>
    </SessionProvider>
  );
}

export { SessionProvider } from './session-provider';
export { BrandingProvider } from './branding-provider';
export { TranslationProvider } from './translation-provider';
