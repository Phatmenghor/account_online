import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectOccupationState = (state: RootState) => state.occupation;
export const selectOccupationData = (state: RootState) => state.occupation.data;
export const selectSelectedOccupation = (state: RootState) => state.occupation.selectedOccupation;
export const selectIsLoading = (state: RootState) => state.occupation.isLoading;
export const selectError = (state: RootState) => state.occupation.error;
export const selectFilters = (state: RootState) => state.occupation.filters;
export const selectOperations = (state: RootState) => state.occupation.operations;

export const selectOccupationContent = createSelector(
  [selectOccupationData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectOccupationData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
