import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllDistrictService,
  getDistrictByIdService,
  createDistrictService,
  updateDistrictService,
  deleteDistrictService
} from "../../services/district/district.service";

export const fetchAllDistrictService = createAsyncThunk(
  "district/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllDistrictService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchDistrictByIdService = createAsyncThunk(
  "district/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getDistrictByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createDistrictThunk = createAsyncThunk(
  "district/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createDistrictService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateDistrictThunk = createAsyncThunk(
  "district/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateDistrictService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteDistrictThunk = createAsyncThunk(
  "district/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteDistrictService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
