'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, LOCALE_NAMES, type Locale } from '@/stores/translation-store';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function LanguageSelector({ variant = 'ghost', showLabel = false }: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales } = useTranslation();

  // Filter to only show locales that are available from backend
  const locales = availableLocales.length > 0 ? availableLocales : ['en', 'he'] as Locale[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={showLabel ? 'default' : 'icon'}>
          <Globe className="h-5 w-5" />
          {showLabel && (
            <span className="ml-2">{LOCALE_NAMES[locale]}</span>
          )}
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {LOCALE_NAMES[loc] || loc.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
