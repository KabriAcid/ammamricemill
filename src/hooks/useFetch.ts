import { useState, useEffect } from 'react';
import { api, ApiError } from '../utils/fetcher';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await api.get<T>(url);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(error as ApiError);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [url, immediate]);

  return {
    ...state,
    refetch,
  };
}