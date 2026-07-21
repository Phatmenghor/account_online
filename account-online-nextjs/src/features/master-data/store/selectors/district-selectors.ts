import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectDistrictState = (state: RootState) => state.district;
export const selectDistrictData = (state: RootState) => state.district.data;
export const selectSelectedDistrict = (state: RootState) => state.district.selectedDistrict;
export const selectIsLoading = (state: RootState) => state.district.isLoading;
export const selectError = (state: RootState) => state.district.error;
export const selectFilters = (state: RootState) => state.district.filters;
export const selectOperations = (state: RootState) => state.district.operations;

export const selectDistrictContent = createSelector(
  [selectDistrictData],
  (data) => data?.content || []
);

export const selectPagination = createSelector([selectDistrictData], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
}));
