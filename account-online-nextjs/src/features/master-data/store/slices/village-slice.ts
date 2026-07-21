import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllVillageService,
  fetchVillageByIdService,
  createVillageThunk,
  updateVillageThunk,
  deleteVillageThunk
} from "../thunks/village-thunks";

const initialState = {
  data: null as any,
  selectedVillage: null as any,
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

const villageSlice = createSlice({
  name: "village",
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
    clearSelectedVillage: (state) => {
      state.selectedVillage = null;
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
      .addCase(fetchAllVillageService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVillageService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllVillageService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(fetchVillageByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
      })
      .addCase(fetchVillageByIdService.fulfilled, (state, action) => {
        state.selectedVillage = action.payload;
        state.operations.isFetchingDetail = false;
      })
      .addCase(fetchVillageByIdService.rejected, (state) => {
        state.operations.isFetchingDetail = false;
      })
      .addCase(createVillageThunk.pending, (state) => {
        state.operations.isCreating = true;
      })
      .addCase(createVillageThunk.fulfilled, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(createVillageThunk.rejected, (state) => {
        state.operations.isCreating = false;
      })
      .addCase(updateVillageThunk.pending, (state) => {
        state.operations.isUpdating = true;
      })
      .addCase(updateVillageThunk.fulfilled, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(updateVillageThunk.rejected, (state) => {
        state.operations.isUpdating = false;
      })
      .addCase(deleteVillageThunk.pending, (state) => {
        state.operations.isDeleting = true;
      })
      .addCase(deleteVillageThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
      })
      .addCase(deleteVillageThunk.rejected, (state) => {
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  setStatusFilter,
  clearSelectedVillage,
  resetFilters,
  resetState,
} = villageSlice.actions;

export default villageSlice.reducer;
