import { api } from './client';
import type { LoginResponse, Tenant, DeviceAuthRequest, DeviceAuthResponse } from '@/types';

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { email, password }, { skipAuth: true });
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/refresh', { refreshToken }, { skipAuth: true });
}

/**
 * Logout (invalidate refresh token)
 */
export async function logout(refreshToken: string): Promise<void> {
  return api.post('/auth/logout', { refreshToken });
}

/**
 * Get current tenant for the authenticated device
 * (protected endpoint - requires device authentication)
 */
export async function getCurrentTenant(): Promise<Tenant> {
  return api.get<Tenant>('/tenants/me');
}

// ===== Device Authentication =====

/**
 * Authenticate a kiosk device using admin credentials
 */
export async function authenticateDevice(request: DeviceAuthRequest): Promise<DeviceAuthResponse> {
  return api.post<DeviceAuthResponse>('/auth/device', request, { skipAuth: true });
}

/**
 * Refresh device tokens (rotating refresh tokens)
 */
export async function refreshDeviceToken(refreshToken: string): Promise<DeviceAuthResponse> {
  return api.post<DeviceAuthResponse>('/auth/device/refresh', { refreshToken }, { skipAuth: true });
}
