// store/thunks/commercialPropertiesThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import collections from "../../../utils/firebaseCollections";
import {
  setCommercialProperties,
  addCommercialProperty,
  updateCommercialProperty,
  deleteCommercialProperty,
  setLoading,
  setError,
} from "./commercialPropertiesSlice";
import { CommercialProperty } from "./commercialPropertiesSlice";

export const listenToCommercialProperties = createAsyncThunk(
  "commercialProperties/listenToCommercialProperties",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = onSnapshot(
        collection(
          db,
          collections.PROPRIETES_USAGE_COMMERCIAL || "PropriétésUsageCommercial"
        ),
        (querySnapshot) => {
          const properties: CommercialProperty[] = querySnapshot.docs.map(
            (doc) => ({
              ...(doc.data() as Omit<CommercialProperty, "id">),
              id: doc.id,
            })
          );
          dispatch(setCommercialProperties(properties));
        },
        (error) => {
          console.error("Erreur lors de l'écoute Firestore:", error);
          dispatch(setError(error.message));
        }
      );
      return { unsubscribe };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCommercialPropertyAsync = createAsyncThunk(
  "commercialProperties/addCommercialPropertyAsync",
  async (
    propertyData: Omit<CommercialProperty, "id">,
    { dispatch, rejectWithValue }
  ) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertiesRef = collection(
        db,
        collections.PROPRIETES_USAGE_COMMERCIAL || "PropriétésUsageCommercial"
      );
      const docRef = await addDoc(propertiesRef, {
        ...propertyData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      const newProperty = { id: docRef.id, ...propertyData };
      dispatch(addCommercialProperty(newProperty));
      return newProperty;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateCommercialPropertyAsync = createAsyncThunk(
  "commercialProperties/updateCommercialPropertyAsync",
  async (property: CommercialProperty, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertyRef = doc(
        db,
        collections.PROPRIETES_USAGE_COMMERCIAL || "PropriétésUsageCommercial",
        property.id
      );
      await updateDoc(propertyRef, {
        ...property,
        updated_at: serverTimestamp(),
      });
      dispatch(updateCommercialProperty(property));
      return property;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteCommercialPropertyAsync = createAsyncThunk(
  "commercialProperties/deleteCommercialPropertyAsync",
  async (propertyId: string, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertyRef = doc(
        db,
        collections.PROPRIETES_USAGE_COMMERCIAL || "PropriétésUsageCommercial",
        propertyId
      );
      await updateDoc(propertyRef, { delete_at: serverTimestamp() }); // Soft delete
      dispatch(deleteCommercialProperty(propertyId));
      return propertyId;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
