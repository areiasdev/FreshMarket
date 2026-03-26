import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";

interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

interface UseAdminListOptions {
  /** URL base sem query params */
  url: string;
  page: number;
  pageSize: number;
  /** Dependências extra que devem forçar reload (ex: selectedStatus) */
  extraDeps?: unknown[];
}

interface UseAdminListReturn<T> {
  data: T[];
  total: number;
  loading: boolean;
  reload: () => Promise<void>;
}

/**
 * Hook partilhado para listar recursos paginados no painel admin.
 * Elimina a duplicação de load/reload em AdminProducts, AdminCategories, etc.
 *
 * Exemplo:
 *   const { data: products, total, loading, reload } = useAdminList<Product>({
 *     url: endpoints.admin.products.getAll,
 *     page,
 *     pageSize,
 *   });
 */
export function useAdminList<T>({
  url,
  page,
  pageSize,
  extraDeps = [],
}: UseAdminListOptions): UseAdminListReturn<T> {
  const [data, setData]     = useState<T[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await client.get<PagedResult<T>>(
          `${url}?page=${page}&pageSize=${pageSize}`
        );
        setData(res.data.items ?? (res.data as unknown as T[]));
        setTotal(res.data.totalCount ?? 0);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, page, pageSize, ...extraDeps]
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const reload = useCallback(() => fetchData(false), [fetchData]);

  return { data, total, loading, reload };
}