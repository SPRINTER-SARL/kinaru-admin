// src/store/users/usersThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import collections from "../../utils/firebaseCollections";
import { User } from "../../types";
import { db } from "../../firebase/firebaseConfig";
import { setUsers } from "./usersSlice";

// Listen to users in real-time using onSnapshot
export const listenToUsers = createAsyncThunk(
  "users/listenToUsers",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, collections.USERS),
        (querySnapshot) => {
          const users: User[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as User),
            id: doc.id, // Use 'id' consistently instead of 'uid'
          }));
          dispatch(setUsers(users)); // Dispatch the setUsers action
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

// Approve a user (set status to 1: actif)
export const approveUser = createAsyncThunk(
  "users/approveUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(db, collections.USERS, userId);
      await updateDoc(userRef, {
        statut: 1, // actif
        lastUpdated: serverTimestamp(),
      });
      // The onSnapshot will automatically update the list
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Reject a user (set status to 2: banni, or keep en_attente? Assuming reject means ban)
export const rejectUser = createAsyncThunk(
  "users/rejectUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(db, collections.USERS, userId);
      await updateDoc(userRef, {
        statut: 2, // banni
        lastUpdated: serverTimestamp(),
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Ban a user (set status to 2: banni)
export const banUser = createAsyncThunk(
  "users/banUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(db, collections.USERS, userId);
      await updateDoc(userRef, {
        statut: 2, // banni
        lastUpdated: serverTimestamp(),
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Unban/Rehabilitate a user (set status to 1: actif)
export const unbanUser = createAsyncThunk(
  "users/unbanUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(db, collections.USERS, userId);
      await updateDoc(userRef, {
        statut: 1, // actif
        lastUpdated: serverTimestamp(),
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);