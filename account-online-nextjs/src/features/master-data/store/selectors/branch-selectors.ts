import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectBranchState = (state: RootState) => state.branch;
export const selectBranchData = (state: RootState) => state.branch.data;
export const selectSelectedBranch = (state: RootState) => state.branch.selectedBranch;
export const selectIsLoading = (state: RootState) => state.branch.isLoading;
export const selectError = (state: RootState) => state.branch.error;
export const selectFilters = (state: RootState) => state.branch.filters;
export const selectOperations = (state: RootState) => state.branch.operations;

export const selectBranchContent = createSelector(
  [selectBranchData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectBranchData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
