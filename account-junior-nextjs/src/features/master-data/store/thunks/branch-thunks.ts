import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllBranchService,
  getBranchByIdService,
  createBranchService,
  updateBranchService,
  deleteBranchService
} from "../../services/branch/branch.service";

export const fetchAllBranchService = createAsyncThunk(
  "branch/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllBranchService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchBranchByIdService = createAsyncThunk(
  "branch/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getBranchByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createBranchThunk = createAsyncThunk(
  "branch/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createBranchService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateBranchThunk = createAsyncThunk(
  "branch/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateBranchService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteBranchThunk = createAsyncThunk(
  "branch/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteBranchService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
