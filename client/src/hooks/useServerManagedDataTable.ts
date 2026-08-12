"use client";

import { PaginationState, SortingState } from "@tanstack/react-table";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

interface UseServerManagedDataTableParams {
  searchParams: ReadonlyURLSearchParams;
  defaultPage?: number;
  defaultLimit?: number;
}

export interface UpdateParamsOptions {
  resetPage?: boolean;
}

export type UpdateParamsFn = (
  updater: (params: URLSearchParams) => void,
  options?: UpdateParamsOptions,
) => void;

const parsePositiveInteger = (
  value: string | null,
  fallbackValue: number,
): number => {
  if (!value) {
    return fallbackValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallbackValue;
  }

  return parsed;
};

export const useServerManagedDataTable = ({
  searchParams,
  defaultPage = 1,
  defaultLimit = 10,
}: UseServerManagedDataTableParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isRouteRefreshPending, startRouteRefreshTransition] = useTransition();

  const queryStringFromUrl = useMemo(
    () => searchParams.toString(),
    [searchParams],
  );

  const paginationStateFromUrl = useMemo<PaginationState>(() => {
    const page = parsePositiveInteger(searchParams.get("page"), defaultPage);
    const limit = parsePositiveInteger(searchParams.get("limit"), defaultLimit);

    return {
      pageIndex: page - 1,
      pageSize: limit,
    };
  }, [defaultLimit, defaultPage, searchParams]);

  const sortingStateFromUrl = useMemo<SortingState>(() => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    if (!sortBy || (sortOrder !== "asc" && sortOrder !== "desc")) {
      return [];
    }

    return [{ id: sortBy, desc: sortOrder === "desc" }];
  }, [searchParams]);

  const [optimisticSortingState, setOptimisticSortingState] =
    useState<SortingState>(sortingStateFromUrl);
  const [optimisticPaginationState, setOptimisticPaginationState] =
    useState<PaginationState>(paginationStateFromUrl);

  // Sync optimistic state back when URL changes (e.g. browser back/forward).
  // setState in useEffect is intentional here — we're syncing from an external
  // system (the URL/History API), which is exactly what effects are for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimisticSortingState(sortingStateFromUrl);
  }, [sortingStateFromUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimisticPaginationState(paginationStateFromUrl);
  }, [paginationStateFromUrl]);

  const updateUrlAndRefresh = useCallback(
    (params: URLSearchParams) => {
      const nextQuery = params.toString();
      const currentQuery = window.location.search.replace(/^\?/, "");

      if (nextQuery === currentQuery) {
        return;
      }

      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

      // Use router.replace (not history.pushState): pushState silently
      // changes the URL without notifying the Next.js router, so
      // useSearchParams keeps returning the old query and server-managed
      // tables never refetch after sort/filter/page changes.
      startRouteRefreshTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, startRouteRefreshTransition],
  );

  const updateParams = useCallback<UpdateParamsFn>(
    (
      updater: (params: URLSearchParams) => void,
      options?: UpdateParamsOptions,
    ) => {
      const params = new URLSearchParams(window.location.search);

      updater(params);

      if (options?.resetPage) {
        params.set("page", "1");
        setOptimisticPaginationState((prevState) => ({
          pageIndex: 0,
          pageSize: prevState.pageSize,
        }));
      }

      updateUrlAndRefresh(params);
    },
    [updateUrlAndRefresh],
  );

  const handleSortingChange = useCallback(
    (state: SortingState) => {
      setOptimisticSortingState(state);

      updateParams(
        (params) => {
          const nextSorting = state[0];

          if (nextSorting) {
            params.set("sortBy", nextSorting.id);
            params.set("sortOrder", nextSorting.desc ? "desc" : "asc");
            return;
          }

          params.delete("sortBy");
          params.delete("sortOrder");
        },
        { resetPage: true },
      );
    },
    [updateParams],
  );

  const handlePaginationChange = useCallback(
    (state: PaginationState) => {
      setOptimisticPaginationState(state);

      updateParams((params) => {
        params.set("page", String(state.pageIndex + 1));
        params.set("limit", String(state.pageSize));
      });
    },
    [updateParams],
  );

  return {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  };
};
