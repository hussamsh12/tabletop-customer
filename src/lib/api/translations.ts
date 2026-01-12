import { api } from './client';

interface TranslationBulkResponse {
  translations: Record<string, Record<string, string>>;
  availableLocales: string[];
}

/**
 * Fetch all translations for the current tenant
 * Returns all keys with all locale values for frontend caching
 */
export async function getTranslations(authToken?: string): Promise<TranslationBulkResponse> {
  return api.get<TranslationBulkResponse>('/translations', { authToken });
}
