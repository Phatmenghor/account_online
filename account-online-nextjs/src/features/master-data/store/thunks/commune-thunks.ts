import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllCommuneService,
  getCommuneByIdService,
  createCommuneService,
  updateCommuneService,
  deleteCommuneService
} from "../../services/commune/commune.service";

export const fetchAllCommuneService = createAsyncThunk(
  "commune/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllCommuneService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchCommuneByIdService = createAsyncThunk(
  "commune/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getCommuneByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createCommuneThunk = createAsyncThunk(
  "commune/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createCommuneService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateCommuneThunk = createAsyncThunk(
  "commune/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateCommuneService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteCommuneThunk = createAsyncThunk(
  "commune/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteCommuneService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
