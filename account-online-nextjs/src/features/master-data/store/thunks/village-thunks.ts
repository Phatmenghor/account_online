import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllVillageService,
  getVillageByIdService,
  createVillageService,
  updateVillageService,
  deleteVillageService
} from "../../services/village/village.service";

export const fetchAllVillageService = createAsyncThunk(
  "village/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllVillageService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchVillageByIdService = createAsyncThunk(
  "village/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getVillageByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createVillageThunk = createAsyncThunk(
  "village/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createVillageService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateVillageThunk = createAsyncThunk(
  "village/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateVillageService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteVillageThunk = createAsyncThunk(
  "village/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteVillageService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
