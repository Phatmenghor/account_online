import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllLegalTypeService,
  getLegalTypeByIdService,
  createLegalTypeService,
  updateLegalTypeService,
  deleteLegalTypeService
} from "../../services/legal-type/legal-type.service";

export const fetchAllLegalTypeService = createAsyncThunk(
  "legalType/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      return await getAllLegalTypeService(params);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const fetchLegalTypeByIdService = createAsyncThunk(
  "legalType/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getLegalTypeByIdService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const createLegalTypeThunk = createAsyncThunk(
  "legalType/create",
  async (data: any, { rejectWithValue }) => {
    try {
      return await createLegalTypeService(data);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const updateLegalTypeThunk = createAsyncThunk(
  "legalType/update",
  async ({ id, updates }: { id: number; updates: any }, { rejectWithValue }) => {
    try {
      return await updateLegalTypeService(id, updates);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);

export const deleteLegalTypeThunk = createAsyncThunk(
  "legalType/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteLegalTypeService(id);
    } catch (err: any) {
      return rejectWithValue(err.errorMessage || err.message || "Failed");
    }
  }
);



