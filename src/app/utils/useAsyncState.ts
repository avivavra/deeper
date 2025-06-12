import { useState, useCallback, useEffect } from 'react';

export type AsyncState<T> =
  | { status: 'loading' | 'error'; data: null }
  | { status: 'succeeded'; data: T };

export const useAsyncState = <T>(initialState: T | (() => Promise<T>)) => {
  const [state, setState] = useState<AsyncState<T>>(
    typeof initialState === 'function'
      ? { status: 'loading', data: null }
      : { status: 'succeeded', data: initialState }
  );

  const fetchData = useCallback(async (fetchFunction: () => Promise<T>) => {
    setState({ status: 'loading', data: null });
    try {
      const data = await fetchFunction();
      setState({ status: 'succeeded', data });
    } catch (error) {
      console.error(error);
      setState({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    if (typeof initialState === 'function') {
      fetchData(initialState as () => Promise<T>);
    }
  }, [initialState, fetchData]);

  return { state, fetchData };
};
