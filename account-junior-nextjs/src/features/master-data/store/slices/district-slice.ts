import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllDistrictService,
  fetchDistrictByIdService,
  createDistrictThunk,
  updateDistrictThunk,
  deleteDistrictThunk
} from "../thunks/district-thunks";

const initialState = {
  data: null as any,
  selectedDistrict: null as any,
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

const districtSlice = createSlice({
  name: "district",
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
    clearSelectedDistrict: (state) => {
      state.selectedDistrict = null;
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
      .addCase(fetchAllDistrictService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDistrictService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllDistrictService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchDistrictByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchDistrictByIdService.fulfilled, (state, action) => {
        state.selectedDistrict = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchDistrictByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createDistrictThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createDistrictThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createDistrictThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateDistrictThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateDistrictThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateDistrictThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteDistrictThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteDistrictThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteDistrictThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedDistrict,
  resetFilters,
  resetState,
} = districtSlice.actions;

export default districtSlice.reducer;
