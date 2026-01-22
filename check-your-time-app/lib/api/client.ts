/**
 * API Client for Django REST Framework
 * Handles authentication, error handling, and request/response interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage (or your auth storage)
        const token = this.getAuthToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Or for DRF Token Authentication:
          // config.headers.Authorization = `Token ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError): Promise<ApiError> {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle DRF error format
      const errorData = data as any;
      
      let errorMessage = 'An error occurred';
      let errors: Record<string, string[]> | undefined;

      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }

        // Extract field-specific errors (DRF format)
        if (errorData && typeof errorData === 'object') {
          errors = {};
          Object.keys(errorData).forEach((key) => {
            if (key !== 'detail' && key !== 'message' && key !== 'non_field_errors') {
              errors![key] = Array.isArray(errorData[key]) 
                ? errorData[key] 
                : [errorData[key]];
            }
          });
        }
      }

      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        this.clearAuthToken();
        // You can add redirect logic here if needed
        errorMessage = 'Authentication required. Please log in.';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }

      return Promise.reject({
        message: errorMessage,
        status,
        errors,
      } as ApiError);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      } as ApiError);
    }
  }

  // Auth token management
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();


