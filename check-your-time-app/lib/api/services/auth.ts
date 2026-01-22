/**
 * Authentication API Service
 * Example service for handling authentication with DRF
 */

import { apiClient, ApiResponse, ApiError } from '../client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  // Add other fields as needed
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    // Add other user fields as needed
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  // Add other user fields as needed
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('auth/login/', credentials);
    
    // Store token if login successful
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('auth/register/', data);
    
    // Store token if registration successful
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  apiClient.clearAuthToken();
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('auth/user/');
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token');
  }
  return false;
};


