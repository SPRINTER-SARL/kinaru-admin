// src/store/contracts/contractsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirestoreContract } from "../../types";
import { archiveContract, listenToContracts, signContract } from "./contractsThunk";

interface ContractsState {
  list: FirestoreContract[];
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void; // To store the unsubscribe function for cleanup
}

const initialState: ContractsState = {
  list: [],
  loading: false,
  error: null,
  unsubscribe: undefined,
};

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setContracts: (state, action: PayloadAction<FirestoreContract[]>) => {
      state.list = action.payload;
    },
    addContract: (state, action: PayloadAction<FirestoreContract>) => {
      state.list.push(action.payload);
    },
    removeContract: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    updateContract: (state, action: PayloadAction<FirestoreContract>) => {
      const index = state.list.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // listenToContracts
    builder
      .addCase(listenToContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listenToContracts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.unsubscribe) {
          state.unsubscribe = action.payload.unsubscribe;
        }
      })
      .addCase(listenToContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Erreur lors du chargement";
      });

    // signContract
    builder
      .addCase(signContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(signContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Erreur lors de la signature";
      });

    // archiveContract
    builder
      .addCase(archiveContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(archiveContract.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(archiveContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Erreur lors de l'archivage";
      });
  },
});

export const { setContracts, addContract, removeContract, updateContract, clearError } = contractsSlice.actions;
export const contractReducer =  contractsSlice.reducer;