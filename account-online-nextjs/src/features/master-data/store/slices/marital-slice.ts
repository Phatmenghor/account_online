import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllMaritalService,
  fetchMaritalByIdService,
  createMaritalThunk,
  updateMaritalThunk,
  deleteMaritalThunk
} from "../thunks/marital-thunks";

const initialState = {
  data: null as any,
  selectedMarital: null as any,
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

const maritalSlice = createSlice({
  name: "marital",
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
    clearSelectedMarital: (state) => {
      state.selectedMarital = null;
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
      .addCase(fetchAllMaritalService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMaritalService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllMaritalService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchMaritalByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchMaritalByIdService.fulfilled, (state, action) => {
        state.selectedMarital = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchMaritalByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createMaritalThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createMaritalThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createMaritalThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateMaritalThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateMaritalThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateMaritalThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteMaritalThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteMaritalThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteMaritalThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedMarital,
  resetFilters,
  resetState,
} = maritalSlice.actions;

export default maritalSlice.reducer;
