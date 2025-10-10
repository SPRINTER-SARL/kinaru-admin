// src/store/users/usersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  listenToUsers,
  approveUser,
  rejectUser,
  banUser,
  unbanUser,
} from "./usersThunks";
import { User } from "../../types";

interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void; // To store the unsubscribe function for cleanup
}

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
  unsubscribe: undefined,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.list.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.list.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // listenToUsers
    builder
      .addCase(listenToUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listenToUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.unsubscribe) {
          state.unsubscribe = action.payload.unsubscribe;
        }
      })
      .addCase(listenToUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Erreur lors du chargement";
      });

    // approveUser
    builder
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Erreur lors de la validation";
      });

    // rejectUser
    builder
      .addCase(rejectUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Erreur lors du rejet";
      });

    // banUser
    builder
      .addCase(banUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(banUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(banUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Erreur lors du bannissement";
      });

    // unbanUser
    builder
      .addCase(unbanUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(unbanUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Erreur lors de la réhabilitation";
      });
  },
});

export const { setUsers, addUser, removeUser, updateUser, clearError } =
  usersSlice.actions;
export const usersReducer = usersSlice.reducer;
