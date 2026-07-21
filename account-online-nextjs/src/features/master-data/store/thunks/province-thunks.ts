import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllProviceService,
  getProvinceByIdService,
  createProvinceService,
  updateProvinceService,
  deleteProvinceService
} from "../../services/province/province.service";

export const fetchAllProvinceService = createAsyncThunk(
  "province/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllProviceService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchProvinceByIdService = createAsyncThunk(
  "province/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getProvinceByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createProvinceThunk = createAsyncThunk(
  "province/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createProvinceService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateProvinceThunk = createAsyncThunk(
  "province/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateProvinceService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteProvinceThunk = createAsyncThunk(
  "province/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteProvinceService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);



