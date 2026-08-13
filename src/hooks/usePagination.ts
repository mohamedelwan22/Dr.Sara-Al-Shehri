import { useMemo, useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

export function usePagination(initialPage = 1, initialPageSize = 12): PaginationState {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage: (next: number) => setPage(Math.max(1, next)),
      setPageSize: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
      reset: () => setPage(1),
    }),
    [page, pageSize],
  );
}
