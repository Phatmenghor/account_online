import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllProvinceService,
  fetchProvinceByIdService,
  createProvinceThunk,
  updateProvinceThunk,
  deleteProvinceThunk
} from "../thunks/province-thunks";

const initialState = {
  data: null as any,
  selectedProvince: null as any,
  isLoading: false,
  error: null as string | null,
  filters: {
    search: "",
    pageNo: 1,
    status: "all",
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const provinceSlice = createSlice({
  name: "province",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    clearSelectedProvince: (state) => {
      state.selectedProvince = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProvinceService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProvinceService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllProvinceService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchProvinceByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchProvinceByIdService.fulfilled, (state, action) => {
        state.selectedProvince = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchProvinceByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createProvinceThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createProvinceThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createProvinceThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateProvinceThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateProvinceThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateProvinceThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteProvinceThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteProvinceThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteProvinceThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedProvince,
  resetFilters,
  resetState,
} = provinceSlice.actions;

export default provinceSlice.reducer;
