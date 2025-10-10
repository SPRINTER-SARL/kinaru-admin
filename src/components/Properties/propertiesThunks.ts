// src/store/properties/propertiesThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { setProperties } from "./propertiesSlice";
import collections from "../../utils/firebaseCollections";
import { FirestoreProperty } from "../../types";
import { db } from "../../firebase/firebaseConfig";

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

// Approve a property (set validationStatus to 'accepte')
export const approveProperty = createAsyncThunk(
  "properties/approveProperty",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const propertyRef = doc(db, collections.PROPRIETES, propertyId);
      await updateDoc(propertyRef, {
        validationStatus: "accepte",
        updated_at: serverTimestamp(),
      });
      // The onSnapshot will automatically update the list
      return propertyId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Reject a property (set validationStatus to 'rejete')
export const rejectProperty = createAsyncThunk(
  "properties/rejectProperty",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const propertyRef = doc(db, collections.PROPRIETES, propertyId);
      await updateDoc(propertyRef, {
        validationStatus: "rejete",
        updated_at: serverTimestamp(),
      });
      return propertyId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
