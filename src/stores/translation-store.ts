import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Locale = 'en' | 'he' | 'ar' | 'sv' | 'ru';

interface TranslationState {
  // Translations data: key -> {locale -> value}
  translations: Record<string, Record<string, string>>;

  // Available locales from backend
  availableLocales: Locale[];

  // Current locale
  locale: Locale;

  // Loading state
  isLoaded: boolean;

  // Actions
  setTranslations: (translations: Record<string, Record<string, string>>, locales: string[]) => void;
  setLocale: (locale: Locale) => void;

  // Translation function
  t: (key: string, fallback?: string) => string;
}

// RTL languages
const RTL_LOCALES: Locale[] = ['he', 'ar'];

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      translations: {},
      availableLocales: ['en'],
      locale: 'en',
      isLoaded: false,

      setTranslations: (translations, locales) => set({
        translations,
        availableLocales: locales as Locale[],
        isLoaded: true,
      }),

      setLocale: (locale) => {
        set({ locale });

        // Update document direction for RTL languages
        if (typeof document !== 'undefined') {
          document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
          document.documentElement.lang = locale;
        }
      },

      t: (key, fallback) => {
        const { translations, locale } = get();
        const entry = translations[key];

        if (!entry) {
          return fallback || key;
        }

        // Try current locale, fallback to English, then to key
        return entry[locale] || entry['en'] || fallback || key;
      },
    }),
    {
      name: 'kiosk-translations',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        // Don't persist translations - always fetch fresh on load
      }),
    }
  )
);

// Helper hook for translation function
export function useTranslation() {
  const t = useTranslationStore((state) => state.t);
  const locale = useTranslationStore((state) => state.locale);
  const setLocale = useTranslationStore((state) => state.setLocale);
  const availableLocales = useTranslationStore((state) => state.availableLocales);
  const isLoaded = useTranslationStore((state) => state.isLoaded);

  return { t, locale, setLocale, availableLocales, isLoaded };
}

// Helper to check if current locale is RTL
export function useIsRTL() {
  const locale = useTranslationStore((state) => state.locale);
  return RTL_LOCALES.includes(locale);
}

// Locale display names (native)
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  ar: 'العربية',
  sv: 'Svenska',
  ru: 'Русский',
};

// Helper hook for catalog item translations
// Structure: { "name": { "he": "Hebrew name" }, "description": { "he": "..." } }
export function useCatalogTranslation() {
  const locale = useTranslationStore((state) => state.locale);

  /**
   * Get translated text from catalog item translations
   * @param translations - Translations object from API { field: { locale: value } }
   * @param field - Field to translate ('name' or 'description')
   * @param fallback - Fallback value (usually English name)
   */
  const ct = (
    translations: Record<string, Record<string, string>> | undefined,
    field: string,
    fallback: string
  ): string => {
    if (!translations) return fallback;

    const fieldTranslations = translations[field];
    if (!fieldTranslations) return fallback;

    // Return translation for current locale, or fallback to original value
    return fieldTranslations[locale] || fallback;
  };

  return { ct, locale };
}
