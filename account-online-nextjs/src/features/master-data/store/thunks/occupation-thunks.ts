import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllOccupationService,
  getOccupationByIdService,
  createOccupationService,
  updateOccupationService,
  deleteOccupationService
} from "../../services/occupation/occupation.service";

export const fetchAllOccupationService = createAsyncThunk(
  "occupation/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllOccupationService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchOccupationByIdService = createAsyncThunk(
  "occupation/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getOccupationByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createOccupationThunk = createAsyncThunk(
  "occupation/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createOccupationService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateOccupationThunk = createAsyncThunk(
  "occupation/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateOccupationService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteOccupationThunk = createAsyncThunk(
  "occupation/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteOccupationService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
