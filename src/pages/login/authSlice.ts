// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";
import { initAuth } from "./zuthThunks";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Met à jour l'utilisateur connecté (utile pour persistence)
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    // Met à jour l'utilisateur connecté (utile pour persistence)
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Clear l'utilisateur (logout manuel)
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },

  // Gestion des états asynchrones des thunks
  extraReducers: (builder) => {
    builder
      // Init Auth (persistence)
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser,setError, clearUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
