import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllCommuneService,
  fetchCommuneByIdService,
  createCommuneThunk,
  updateCommuneThunk,
  deleteCommuneThunk
} from "../thunks/commune-thunks";

const initialState = {
  data: null as any,
  selectedCommune: null as any,
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

const communeSlice = createSlice({
  name: "commune",
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
    clearSelectedCommune: (state) => {
      state.selectedCommune = null;
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
      .addCase(fetchAllCommuneService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCommuneService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllCommuneService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchCommuneByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchCommuneByIdService.fulfilled, (state, action) => {
        state.selectedCommune = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchCommuneByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createCommuneThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createCommuneThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createCommuneThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateCommuneThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateCommuneThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateCommuneThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteCommuneThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteCommuneThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteCommuneThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedCommune,
  resetFilters,
  resetState,
} = communeSlice.actions;

export default communeSlice.reducer;
