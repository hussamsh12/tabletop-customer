import { api } from './client';
import type { StoreBrief, Store } from '@/types';

/**
 * Fetch all active stores (brief info for store selection)
 * @param authToken Optional token for immediate use after login
 */
export async function getActiveStores(authToken?: string): Promise<StoreBrief[]> {
  return api.get<StoreBrief[]>('/stores/active/brief', { authToken });
}

/**
 * Fetch store details by ID
 */
export async function getStoreById(storeId: string): Promise<Store> {
  return api.get<Store>(`/stores/${storeId}`);
}
