import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectVillageState = (state: RootState) => state.village;
export const selectVillageData = (state: RootState) => state.village.data;
export const selectSelectedVillage = (state: RootState) => state.village.selectedVillage;
export const selectIsLoading = (state: RootState) => state.village.isLoading;
export const selectError = (state: RootState) => state.village.error;
export const selectFilters = (state: RootState) => state.village.filters;
export const selectOperations = (state: RootState) => state.village.operations;

export const selectVillageContent = createSelector(
  [selectVillageData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectVillageData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
