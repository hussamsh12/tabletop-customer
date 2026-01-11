import { api } from './client';
import type { StoreBrief, Store } from '@/types';

/**
 * Fetch all active stores (brief info for store selection)
 */
export async function getActiveStores(): Promise<StoreBrief[]> {
  return api.get<StoreBrief[]>('/stores/active/brief');
}

/**
 * Fetch store details by ID
 */
export async function getStoreById(storeId: string): Promise<Store> {
  return api.get<Store>(`/stores/${storeId}`);
}
