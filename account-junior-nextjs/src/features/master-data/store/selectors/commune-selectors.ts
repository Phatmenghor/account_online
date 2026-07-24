import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCommuneState = (state: RootState) => state.commune;
export const selectCommuneData = (state: RootState) => state.commune.data;
export const selectSelectedCommune = (state: RootState) => state.commune.selectedCommune;
export const selectIsLoading = (state: RootState) => state.commune.isLoading;
export const selectError = (state: RootState) => state.commune.error;
export const selectFilters = (state: RootState) => state.commune.filters;
export const selectOperations = (state: RootState) => state.commune.operations;

export const selectCommuneContent = createSelector(
  [selectCommuneData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectCommuneData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
