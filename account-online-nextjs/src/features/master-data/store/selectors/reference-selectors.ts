import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectReferenceState = (state: RootState) => state.reference;
export const selectReferenceData = (state: RootState) => state.reference.data;
export const selectSelectedReference = (state: RootState) => state.reference.selectedReference;
export const selectIsLoading = (state: RootState) => state.reference.isLoading;
export const selectError = (state: RootState) => state.reference.error;
export const selectFilters = (state: RootState) => state.reference.filters;
export const selectOperations = (state: RootState) => state.reference.operations;

export const selectReferenceContent = createSelector(
  [selectReferenceData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectReferenceData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
