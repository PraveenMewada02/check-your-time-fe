/**
 * Example API Service
 * Replace this with your actual API endpoints
 * This demonstrates common CRUD operations with DRF
 */

import { apiClient, ApiResponse, ApiError } from '../client';

// Example: Replace with your actual data types
export interface ExampleItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExampleItem {
  title: string;
  description: string;
}

/**
 * Get all items
 */
export const getItems = async (): Promise<ExampleItem[]> => {
  try {
    const response = await apiClient.get<ExampleItem[]>('items/');
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Get single item by ID
 */
export const getItem = async (id: number): Promise<ExampleItem> => {
  try {
    const response = await apiClient.get<ExampleItem>(`items/${id}/`);
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Create new item
 */
export const createItem = async (data: CreateExampleItem): Promise<ExampleItem> => {
  try {
    const response = await apiClient.post<ExampleItem>('items/', data);
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Update item
 */
export const updateItem = async (id: number, data: Partial<CreateExampleItem>): Promise<ExampleItem> => {
  try {
    const response = await apiClient.patch<ExampleItem>(`items/${id}/`, data);
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};

/**
 * Delete item
 */
export const deleteItem = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`items/${id}/`);
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};


