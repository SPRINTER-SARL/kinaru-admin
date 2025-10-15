// store/properties/propertiesThunks.ts (updated to use service)
import { createAsyncThunk } from "@reduxjs/toolkit";
import { collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { setProperties } from "./propertiesSlice";
import collections from "../../utils/firebaseCollections";
import { FirestoreProperty } from "../../types";
import { db } from "../../firebase/firebaseConfig";
import {
  EmailData,
  updatePropertyValidationService,
} from "./propertiesServices";
import { deleteFile, updateDocument } from "../../firebase/firebaseService";

// Listen to properties in real-time using onSnapshot
export const listenToProperties = createAsyncThunk(
  "properties/listenToProperties",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, collections.PROPRIETES),
        (querySnapshot) => {
          const properties: FirestoreProperty[] = querySnapshot.docs.map(
            (doc) => ({
              ...(doc.data() as FirestoreProperty),
              id: doc.id,
            })
          );
          dispatch(setProperties(properties)); // Dispatch the setProperties action
        },
        (error) => {
          console.error("Erreur lors de l'écoute Firestore:", error);
          rejectWithValue(error.message);
        }
      );
      return { unsubscribe }; // Return unsubscribe function for cleanup
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Combined thunk for updating property validation (approve/reject/cancel)
export const updatePropertyValidation = createAsyncThunk(
  "properties/updatePropertyValidation",
  async (
    {
      propertyId,
      emailData,
      status,
    }: {
      propertyId: string;
      emailData: EmailData;
      status: "accepte" | "rejete" | "annule";
    },
    { rejectWithValue }
  ) => {
    try {
      await updatePropertyValidationService(propertyId, status, emailData);
      return { propertyId, status };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for soft deleting a property by setting delete_at timestamp
export const deleteProperty = createAsyncThunk(
  "properties/deleteProperty",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const timestamp = serverTimestamp()
      // Update the property document to set delete_at field
      await updateDocument(collections.PROPRIETES, propertyId, { delete_at: timestamp });
      return propertyId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
