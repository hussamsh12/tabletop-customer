import { api } from './client';
import type { CreateOrderRequest, OrderResponse } from '@/types';

/**
 * Create a new order
 */
export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  return api.post<OrderResponse>('/orders', request);
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return api.get<OrderResponse>(`/orders/${orderId}`);
}
