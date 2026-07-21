import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllOccupationService,
  fetchOccupationByIdService,
  createOccupationThunk,
  updateOccupationThunk,
  deleteOccupationThunk
} from "../thunks/occupation-thunks";

const initialState = {
  data: null as any,
  selectedOccupation: null as any,
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

const occupationSlice = createSlice({
  name: "occupation",
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
    clearSelectedOccupation: (state) => {
      state.selectedOccupation = null;
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
      .addCase(fetchAllOccupationService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOccupationService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllOccupationService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchOccupationByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchOccupationByIdService.fulfilled, (state, action) => {
        state.selectedOccupation = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchOccupationByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createOccupationThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createOccupationThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createOccupationThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateOccupationThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateOccupationThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateOccupationThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteOccupationThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteOccupationThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteOccupationThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedOccupation,
  resetFilters,
  resetState,
} = occupationSlice.actions;

export default occupationSlice.reducer;
