import { useState, useCallback, useEffect } from 'react';

type AsyncState<T> =
  | { status: 'loading' | 'error'; data: null }
  | { status: 'succeeded'; data: T };

const useAsyncState = <T>(fetchFunction: () => Promise<T>, initialState: T | null = null) => {
  const [state, setState] = useState<AsyncState<T>>(
    initialState
      ? { status: 'succeeded', data: initialState }
      : { status: 'loading', data: null }
  );

  const fetchData = useCallback(async (fetchFn?: () => Promise<T>) => {
    setState({ status: 'loading', data: null });
    try {
      const data = await (fetchFn ? fetchFn() : fetchFunction());
      setState({ status: 'succeeded', data });
    } catch (error) {
      setState({ status: 'error', data: null });
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (!initialState) {
      fetchData();
    }
  }, [fetchData, initialState]);

  return { state, fetchData };
};

export default useAsyncState;
