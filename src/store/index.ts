import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "../components/Users/usersSlice";
import { authReducer } from "../pages/login/authSlice";
import { initAuth } from "../pages/login/zuthThunks";
import { propertiesReducer } from "../components/Properties/propertiesSlice";
import { contractReducer } from "../components/Contracts/contractsSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    auth: authReducer,
    properties: propertiesReducer,
    contracts: contractReducer,
  },
});

store.dispatch(initAuth());

// Types pour les hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
