// store/authThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { User } from "../../types";
import collections from "../../utils/firebaseCollections";
import { auth, db } from "../../firebase/firebaseConfig";

// --- Initialisation de l'état d'auth avec persistence ---
export const initAuth = createAsyncThunk<User | null>(
  "auth/initAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Étape 1 : on signale le début du chargement
      dispatch({
        type: "auth/setError",
        payload: null,
      });
      dispatch({
        type: "auth/setLoading",
        payload: true,
      });

      return await new Promise<User | null>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            // Étape 2 : aucun utilisateur connecté
            if (!user) {
              dispatch({ type: "auth/setUser", payload: null });
              dispatch({ type: "auth/setLoading", payload: false });
              resolve(null);
              unsubscribe();
              return;
            }

            // Étape 3 : récupération du profil Firestore
            const userRef = doc(db, collections.USERS, user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              dispatch({
                type: "auth/setError",
                payload: "Profil utilisateur introuvable",
              });
              dispatch({ type: "auth/setUser", payload: null });
              dispatch({ type: "auth/setLoading", payload: false });
              resolve(null);
              unsubscribe();
              return;
            }

            // Étape 4 : succès — utilisateur récupéré
            const userObj: User = {
              ...(userSnap.data() as Omit<User, "id">),
              id: userSnap.id,
            };

            dispatch({ type: "auth/setUser", payload: userObj });
            dispatch({ type: "auth/setLoading", payload: false });
            dispatch({ type: "auth/setError", payload: null });

            resolve(userObj);
            unsubscribe();
          } catch (err: any) {
            // Étape 5 : erreur lors de la récupération du profil
            dispatch({
              type: "auth/setError",
              payload:
                err.message ??
                "Erreur lors du chargement du profil utilisateur",
            });
            dispatch({ type: "auth/setLoading", payload: false });
            reject(err);
          }
        });
      });
    } catch (error: any) {
      // Étape 6 : erreur globale inattendue
      dispatch({
        type: "auth/setError",
        payload: error.message ?? "Erreur inconnue",
      });
      dispatch({ type: "auth/setLoading", payload: false });
      return rejectWithValue(error.message);
    }
  }
);
// logout thunk
export const logout = createAsyncThunk<void>(
  "auth/logout",
  async (_, { dispatch }) => {
    await auth.signOut();
    dispatch({ type: "auth/clearUser" });
  }
);
