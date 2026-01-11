import { api } from './client';
import type { Category, MenuItem } from '@/types';

/**
 * Fetch full menu with categories and items for a store
 */
export async function getMenu(): Promise<Category[]> {
  return api.get<Category[]>('/categories/menu');
}

/**
 * Fetch item details with variants and modifier groups
 */
export async function getItemDetails(itemId: string): Promise<MenuItem> {
  return api.get<MenuItem>(`/items/${itemId}/details`);
}
