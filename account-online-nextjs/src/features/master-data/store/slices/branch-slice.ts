import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllBranchService,
  fetchBranchByIdService,
  createBranchThunk,
  updateBranchThunk,
  deleteBranchThunk
} from "../thunks/branch-thunks";

const initialState = {
  data: null as any,
  selectedBranch: null as any,
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

const branchSlice = createSlice({
  name: "branch",
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
    clearSelectedBranch: (state) => {
      state.selectedBranch = null;
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
      .addCase(fetchAllBranchService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBranchService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllBranchService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchBranchByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchBranchByIdService.fulfilled, (state, action) => {
        state.selectedBranch = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchBranchByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createBranchThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createBranchThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createBranchThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateBranchThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateBranchThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateBranchThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteBranchThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteBranchThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteBranchThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedBranch,
  resetFilters,
  resetState,
} = branchSlice.actions;

export default branchSlice.reducer;
