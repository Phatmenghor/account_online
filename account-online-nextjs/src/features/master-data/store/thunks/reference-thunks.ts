import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllReferenceService,
  getReferenceByIdService,
  createReferenceService,
  updateReferenceService,
  deleteReferenceService
} from "../../services/reference/reference.service";

export const fetchAllReferenceService = createAsyncThunk(
  "reference/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllReferenceService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchReferenceByIdService = createAsyncThunk(
  "reference/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getReferenceByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createReferenceThunk = createAsyncThunk(
  "reference/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createReferenceService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateReferenceThunk = createAsyncThunk(
  "reference/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateReferenceService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteReferenceThunk = createAsyncThunk(
  "reference/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteReferenceService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);
