// store/thunks/residentialPropertiesThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { setResidentialProperties, addResidentialProperty, updateResidentialProperty, deleteResidentialProperty, setLoading, setError } from './residentialPropertiesSlice';
import collections from '../../../utils/firebaseCollections';
import { ResidentialProperty } from './residentialPropertiesSlice';
import { db } from '../../../firebase/firebaseConfig';

export const listenToResidentialProperties = createAsyncThunk(
  'residentialProperties/listenToResidentialProperties',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, collections.PROPRIETES_USAGE_RESIDENTIEL || 'PropriétésUsageResidentiel'),
        (querySnapshot) => {
          const properties: ResidentialProperty[] = querySnapshot.docs.map(
            (doc) => ({
              ...(doc.data() as Omit<ResidentialProperty, 'id'>),
              id: doc.id,
            })
          );
          dispatch(setResidentialProperties(properties));
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

export const addResidentialPropertyAsync = createAsyncThunk(
  'residentialProperties/addResidentialPropertyAsync',
  async (propertyData: Omit<ResidentialProperty, 'id'>, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertiesRef = collection(db, collections.PROPRIETES_USAGE_RESIDENTIEL || 'PropriétésUsageResidentiel');
      const docRef = await addDoc(propertiesRef, {
        ...propertyData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      const newProperty = { id: docRef.id, ...propertyData };
      dispatch(addResidentialProperty(newProperty));
      return newProperty;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateResidentialPropertyAsync = createAsyncThunk(
  'residentialProperties/updateResidentialPropertyAsync',
  async (property: ResidentialProperty, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertyRef = doc(db, collections.PROPRIETES_USAGE_RESIDENTIEL || 'PropriétésUsageResidentiel', property.id);
      await updateDoc(propertyRef, {
        ...property,
        updated_at: serverTimestamp(),
      });
      dispatch(updateResidentialProperty(property));
      return property;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteResidentialPropertyAsync = createAsyncThunk(
  'residentialProperties/deleteResidentialPropertyAsync',
  async (propertyId: string, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const propertyRef = doc(db, collections.PROPRIETES_USAGE_RESIDENTIEL || 'PropriétésUsageResidentiel', propertyId);
      await updateDoc(propertyRef, { delete_at: serverTimestamp() }); // Soft delete
      dispatch(deleteResidentialProperty(propertyId));
      return propertyId;
    } catch (error: any) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);