import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllLegalTypeService,
  fetchLegalTypeByIdService,
  createLegalTypeThunk,
  updateLegalTypeThunk,
  deleteLegalTypeThunk
} from "../thunks/legaltype-thunks";

const initialState = {
  data: null as any,
  selectedLegalType: null as any,
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

const legalTypeSlice = createSlice({
  name: "legalType",
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
    clearSelectedLegalType: (state) => {
      state.selectedLegalType = null;
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
      .addCase(fetchAllLegalTypeService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLegalTypeService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllLegalTypeService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchLegalTypeByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchLegalTypeByIdService.fulfilled, (state, action) => {
        state.selectedLegalType = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchLegalTypeByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createLegalTypeThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createLegalTypeThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createLegalTypeThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateLegalTypeThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateLegalTypeThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateLegalTypeThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteLegalTypeThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteLegalTypeThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteLegalTypeThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedLegalType,
  resetFilters,
  resetState,
} = legalTypeSlice.actions;

export default legalTypeSlice.reducer;
