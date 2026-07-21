import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectProvinceState = (state: RootState) => state.province;
export const selectProvinceData = (state: RootState) => state.province.data;
export const selectSelectedProvince = (state: RootState) => state.province.selectedProvince;
export const selectIsLoading = (state: RootState) => state.province.isLoading;
export const selectError = (state: RootState) => state.province.error;
export const selectFilters = (state: RootState) => state.province.filters;
export const selectOperations = (state: RootState) => state.province.operations;

export const selectProvinceContent = createSelector(
  [selectProvinceData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectProvinceData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
