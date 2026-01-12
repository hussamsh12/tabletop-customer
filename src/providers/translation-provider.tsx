'use client';

import { useEffect, useRef } from 'react';
import { useTranslationStore } from '@/stores/translation-store';
import { useSessionStore } from '@/stores/session-store';
import { getTranslations } from '@/lib/api';

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const hasFetched = useRef(false);
  const setTranslations = useTranslationStore((state) => state.setTranslations);
  const locale = useTranslationStore((state) => state.locale);
  const isDeviceAuthenticated = useSessionStore((state) => state.isDeviceAuthenticated);
  const accessToken = useSessionStore((state) => state.accessToken);

  // Set document direction based on locale
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rtlLocales = ['he', 'ar'];
      document.documentElement.dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Fetch translations when authenticated
  useEffect(() => {
    if (!isDeviceAuthenticated || !accessToken || hasFetched.current) return;

    const fetchTranslations = async () => {
      try {
        const response = await getTranslations(accessToken);
        setTranslations(response.translations, response.availableLocales);
        hasFetched.current = true;
        console.log('[TranslationProvider] Loaded translations:', Object.keys(response.translations).length, 'keys');
      } catch (error) {
        console.error('[TranslationProvider] Failed to fetch translations:', error);
        // Don't block app - translations will fallback to keys
      }
    };

    fetchTranslations();
  }, [isDeviceAuthenticated, accessToken, setTranslations]);

  return <>{children}</>;
}
