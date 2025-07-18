/**
 * useAsyncError Hook
 * Custom hook for handling async errors that can be caught by error boundaries
 */

"use client";

import { useCallback, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isEmpty: boolean;
}

interface AsyncActions<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
  setLoading: (loading: boolean) => void;
}

interface UseAsyncErrorOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  isEmpty?: (data: T) => boolean;
}

/**
 * Hook for managing async operations with error boundary integration
 */
export function useAsyncError<T = any>(
  options: UseAsyncErrorOptions<T> = {}
): [AsyncState<T>, AsyncActions<T>] {
  const {
    initialData = null,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
    isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0)
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    isLoading: false,
    isEmpty: initialData ? isEmpty(initialData) : false
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
      isLoading: false,
      isEmpty: isEmpty(data)
    }));
    
    if (onSuccess) {
      onSuccess(data);
    }
  }, [onSuccess, isEmpty]);

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      isLoading: false,
      isEmpty: initialData ? isEmpty(initialData) : false
    });
  }, [initialData, isEmpty]);

  const executeWithRetry = useCallback(async (
    asyncFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (attempt < retryCount && !err.message.includes('abort')) {
        console.warn(`Async operation failed (attempt ${attempt}/${retryCount}), retrying...`, err);
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
        );
        
        return executeWithRetry(asyncFn, attempt + 1);
      }
      
      // All retries exhausted or non-retryable error
      console.error(`Async operation failed after ${attempt} attempts:`, err);
      setError(err);
      return null;
    }
  }, [setData, setError, setLoading, retryCount, retryDelay]);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    return executeWithRetry(asyncFn);
  }, [executeWithRetry]);

  const actions: AsyncActions<T> = {
    execute,
    reset,
    setData,
    setError,
    setLoading
  };

  return [state, actions];
}

/**
 * Hook for handling multiple async operations
 */
export function useMultipleAsyncError<T extends Record<string, any>>(
  operations: Record<keyof T, UseAsyncErrorOptions<T[keyof T]>>
): Record<keyof T, [AsyncState<T[keyof T]>, AsyncActions<T[keyof T]>]> {
  const results = {} as Record<keyof T, [AsyncState<T[keyof T]>, AsyncActions<T[keyof T]>]>;
  
  for (const key in operations) {
    results[key] = useAsyncError(operations[key]);
  }
  
  return results;
}

/**
 * Utility function to throw async errors that can be caught by error boundaries
 */
export function throwAsyncError(error: Error | string): never {
  const err = typeof error === 'string' ? new Error(error) : error;
  
  // Add error to the next tick so it can be caught by error boundaries
  setTimeout(() => {
    throw err;
  }, 0);
  
  throw err;
}

/**
 * Wrapper function for async operations that ensures errors are thrown properly
 */
export async function withAsyncError<T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
    const err = error instanceof Error 
      ? error 
      : new Error(errorMessage || 'Async operation failed');
    
    throwAsyncError(err);
  }
}

export default useAsyncError;