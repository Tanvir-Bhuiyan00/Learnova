"use client";

import DataTable from "@/components/shared/table/DataTable";
import {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { getInstructors } from "@/services/instructor.services";
import { PaginationMeta } from "@/types/api.types";
import { IInstructor } from "@/types/instructor.types";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import CreateInstructorFormModal from "./CreateInstructorFormModal";
import DeleteInstructorConfirmationDialog from "./DeleteInstructorConfirmationDialog";
import EditInstructorFormModal from "./EditInstructorFormModal";
import ViewInstructorProfileDialog from "./ViewInstructorProfileDialog";
import { instructorColumns } from "./InstructorsColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const EXPERIENCE_FILTER_KEY = "experience";
const INSTRUCTOR_FILTER_DEFINITIONS = [
  serverManagedFilter.multi("qualification"),
  serverManagedFilter.multi("designation"),
  serverManagedFilter.multi("currentWorkingPlace"),
  serverManagedFilter.range(EXPERIENCE_FILTER_KEY),
];

const InstructorsTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
  const {
    viewingItem,
    editingItem,
    deletingItem,
    isViewDialogOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    onViewOpenChange,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IInstructor>();

  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  });

  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({
      searchParams,
      definitions: INSTRUCTOR_FILTER_DEFINITIONS,
      updateParams,
    });

  const {
    data: instructorDataResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["instructors", queryString],
    queryFn: () => getInstructors(queryString),
  });

  const instructors = instructorDataResponse?.data ?? [];
  const meta: PaginationMeta | undefined = instructorDataResponse?.meta;

  const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
    return [
      {
        id: "qualification",
        label: "Qualification",
        type: "multi-select",
        options: [],
      },
      {
        id: "designation",
        label: "Designation",
        type: "multi-select",
        options: [],
      },
      {
        id: "currentWorkingPlace",
        label: "Working At",
        type: "multi-select",
        options: [],
      },
      {
        id: "experience",
        label: "Experience (Years)",
        type: "range",
      },
    ];
  }, []);

  const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
    return {
      qualification: filterValues.qualification,
      designation: filterValues.designation,
      currentWorkingPlace: filterValues.currentWorkingPlace,
      experience: filterValues[EXPERIENCE_FILTER_KEY],
    };
  }, [filterValues]);

  return (
    <>
      <DataTable
        data={instructors}
        columns={instructorColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No instructors found."
        sorting={{
          state: optimisticSortingState,
          onSortingChange: handleSortingChange,
        }}
        pagination={{
          state: optimisticPaginationState,
          onPaginationChange: handlePaginationChange,
        }}
        search={{
          initialValue: searchTermFromUrl,
          placeholder: "Search instructor by name, email...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        filters={{
          configs: filterConfigs,
          values: filterValuesForTable,
          onFilterChange: handleFilterChange,
          onClearAll: clearAllFilters,
        }}
        toolbarAction={
          <CreateInstructorFormModal />
        }
        meta={meta}
        actions={tableActions}
      />

      <EditInstructorFormModal
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
        instructor={editingItem}
      />

      <DeleteInstructorConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        instructor={deletingItem}
      />

      <ViewInstructorProfileDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        instructor={viewingItem}
      />
    </>
  );
};
export default InstructorsTable;
