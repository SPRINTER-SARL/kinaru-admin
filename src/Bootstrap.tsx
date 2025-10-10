"use client";

import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { listenToUsers } from "./components/Users/usersThunks";
import { initAuth } from "./pages/login/zuthThunks";
import { listenToProperties } from "./components/Properties/propertiesThunks";
import { listenToContracts } from "./components/Contracts/contractsThunk";

export default function Bootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());
    dispatch(listenToUsers());
    dispatch(listenToProperties());

    dispatch(listenToContracts()); // If not already listening globally
  }, [dispatch]);

  return null;
}
