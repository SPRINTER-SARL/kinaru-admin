// src/store/properties/propertiesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  listenToProperties,
  updatePropertyValidation,
} from "./propertiesThunks";
import { FirestoreProperty } from "../../types";

interface PropertiesState {
  list: FirestoreProperty[];
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void; // To store the unsubscribe function for cleanup
}

const initialState: PropertiesState = {
  list: [],
  loading: false,
  error: null,
  unsubscribe: undefined,
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<FirestoreProperty[]>) => {
      state.list = action.payload;
    },
    addProperty: (state, action: PayloadAction<FirestoreProperty>) => {
      state.list.push(action.payload);
    },
    removeProperty: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
    updateProperty: (state, action: PayloadAction<FirestoreProperty>) => {
      const index = state.list.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // listenToProperties
    builder
      .addCase(listenToProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listenToProperties.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.unsubscribe) {
          state.unsubscribe = action.payload.unsubscribe;
        }
      })
      .addCase(listenToProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Erreur lors du chargement";
      });

    // approveProperty
    builder
      .addCase(updatePropertyValidation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePropertyValidation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePropertyValidation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Erreur lors de la validation";
      });

  },
});

export const {
  setProperties,
  addProperty,
  removeProperty,
  updateProperty,
  clearError,
} = propertiesSlice.actions;
export const propertiesReducer = propertiesSlice.reducer;
