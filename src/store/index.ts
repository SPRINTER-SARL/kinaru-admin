import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "../components/Users/usersSlice";
import { authReducer } from "../pages/login/authSlice";
import { initAuth } from "../pages/login/zuthThunks";
import { propertiesReducer } from "../components/Properties/propertiesSlice";
import { contractReducer } from "../components/Contracts/contractsSlice";
import { commercialProperties } from "../pages/properties/commercials/commercialPropertiesSlice";
import { residentialProperties } from "../pages/properties/residential/residentialPropertiesSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    auth: authReducer,
    properties: propertiesReducer,
    contracts: contractReducer,
    commercialProperties: commercialProperties,
    residentialProperties,
  },
});

store.dispatch(initAuth());

// Types pour les hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
