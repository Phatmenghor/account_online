import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectMaritalState = (state: RootState) => state.marital;
export const selectMaritalData = (state: RootState) => state.marital.data;
export const selectSelectedMarital = (state: RootState) => state.marital.selectedMarital;
export const selectIsLoading = (state: RootState) => state.marital.isLoading;
export const selectError = (state: RootState) => state.marital.error;
export const selectFilters = (state: RootState) => state.marital.filters;
export const selectOperations = (state: RootState) => state.marital.operations;

export const selectMaritalContent = createSelector(
  [selectMaritalData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectMaritalData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
