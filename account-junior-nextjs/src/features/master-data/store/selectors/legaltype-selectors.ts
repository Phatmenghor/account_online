import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectLegalTypeState = (state: RootState) => state.legalType;
export const selectLegalTypeData = (state: RootState) => state.legalType.data;
export const selectSelectedLegalType = (state: RootState) => state.legalType.selectedLegalType;
export const selectIsLoading = (state: RootState) => state.legalType.isLoading;
export const selectError = (state: RootState) => state.legalType.error;
export const selectFilters = (state: RootState) => state.legalType.filters;
export const selectOperations = (state: RootState) => state.legalType.operations;

export const selectLegalTypeContent = createSelector(
  [selectLegalTypeData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectLegalTypeData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
