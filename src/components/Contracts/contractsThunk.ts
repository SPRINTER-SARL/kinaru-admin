// src/store/contracts/contractsThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import collections from "../../utils/firebaseCollections";
import { FirestoreContract } from "../../types";
import { setContracts } from "./contractsSlice";
import { db } from "../../firebase/firebaseConfig";

// Listen to contracts in real-time using onSnapshot
export const listenToContracts = createAsyncThunk(
  "contracts/listenToContracts",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, collections.CONTRATS),
        (querySnapshot) => {
          const contracts: FirestoreContract[] = querySnapshot.docs.map(
            (doc) => ({
              ...(doc.data() as FirestoreContract),
              id: doc.id,
            })
          );
          dispatch(setContracts(contracts)); // Dispatch the setContracts action
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

// Sign a contract (set signatureStatus to 'signe')
export const signContract = createAsyncThunk(
  "contracts/signContract",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const contractRef = doc(db, collections.CONTRATS, contractId);
      await updateDoc(contractRef, {
        signatureStatus: "signe",
        updated_at: serverTimestamp(),
      });
      // The onSnapshot will automatically update the list
      return contractId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Archive a contract (set statut to 0: expire, or a specific archived status if needed)
export const archiveContract = createAsyncThunk(
  "contracts/archiveContract",
  async (contractId: string, { rejectWithValue }) => {
    try {
      const contractRef = doc(db, collections.CONTRATS, contractId);
      await updateDoc(contractRef, {
        statut: 0, // expire
        updated_at: serverTimestamp(),
      });
      return contractId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
