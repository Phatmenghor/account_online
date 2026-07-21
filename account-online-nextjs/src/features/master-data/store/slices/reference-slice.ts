import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllReferenceService,
  fetchReferenceByIdService,
  createReferenceThunk,
  updateReferenceThunk,
  deleteReferenceThunk
} from "../thunks/reference-thunks";

const initialState = {
  data: null as any,
  selectedReference: null as any,
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

const referenceSlice = createSlice({
  name: "reference",
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
    clearSelectedReference: (state) => {
      state.selectedReference = null;
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
      .addCase(fetchAllReferenceService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReferenceService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllReferenceService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchReferenceByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchReferenceByIdService.fulfilled, (state, action) => {
        state.selectedReference = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchReferenceByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createReferenceThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createReferenceThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createReferenceThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateReferenceThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateReferenceThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateReferenceThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteReferenceThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteReferenceThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteReferenceThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedReference,
  resetFilters,
  resetState,
} = referenceSlice.actions;

export default referenceSlice.reducer;
