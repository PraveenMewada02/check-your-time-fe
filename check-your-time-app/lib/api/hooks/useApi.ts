/**
 * Custom React Hook for API calls
 * Provides loading, error, and data states
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for making API calls
 * @param apiCall - Function that returns a Promise
 * @param immediate - Whether to call the API immediately (default: true)
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  immediate: boolean = true
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    refetch: execute,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<TData, TVariables = void>() {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    apiCall: (variables: TVariables) => Promise<TData>,
    variables: TVariables
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall(variables);
      setState({ data, loading: false, error: null });
      return { data, error: null };
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
      return { data: null, error: apiError };
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}


