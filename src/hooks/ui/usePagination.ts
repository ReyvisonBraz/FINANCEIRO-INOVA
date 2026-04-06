import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, onPageChange } = options;
  const [page, setPage] = useState(initialPage);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  const resetPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  return {
    page,
    setPage: goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
}

export default usePagination;
