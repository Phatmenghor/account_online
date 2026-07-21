import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllMaritalService,
  getMaritalByIdService,
  createMaritalService,
  updateMaritalService,
  deleteMaritalService
} from "../../services/marital/marital.service";

export const fetchAllMaritalService = createAsyncThunk(
  "marital/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllMaritalService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchMaritalByIdService = createAsyncThunk(
  "marital/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getMaritalByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createMaritalThunk = createAsyncThunk(
  "marital/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createMaritalService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateMaritalThunk = createAsyncThunk(
  "marital/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateMaritalService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteMaritalThunk = createAsyncThunk(
  "marital/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteMaritalService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
