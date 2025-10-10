"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { and, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { setUser } from "./authSlice";
import { User } from "../../types";
import collections from "../../utils/firebaseCollections";
import { collection, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const dispatch = useDispatch();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "L’email est requis.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      newErrors.email = "Email invalide.";
    if (!password) newErrors.password = "Le mot de passe est requis.";
    else if (password.length < 6) newErrors.password = "Au moins 6 caractères.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Récupérer les infos du user dans la collection "users"
      // Chercher l'utilisateur dans la collection "users" en fonction de la propriété "uid"
      const usersRef = collection(db, collections.USERS);
      const q = query(
        usersRef,
        and(
          // where("typeUsersId", "==", USER_TYPES.ADMIN.id),
          where("uid", "==", user.uid)
        )
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("JggTrJTHl6eWYotFtKPSoRMBFE62 ! ", userData);
        dispatch(
          setUser({
            ...(userData as User),
            uid: user.uid,
            id: querySnapshot.docs[0].id,
          })
        );
      } else {
        setErrors({ email: "Utilisateur non trouvé dans la base." });
      }
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setErrors({ email: "Email ou mot de passe incorrect." });
      } else {
        setErrors({ email: "Erreur de connexion. Réessayez." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResetSent(false);
    setErrors({});
    if (!email) {
      setErrors({ email: "Veuillez entrer votre email pour réinitialiser." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setErrors({ email: "Aucun utilisateur trouvé avec cet email." });
      } else if (err.code === "auth/invalid-email") {
        setErrors({ email: "Email invalide." });
      } else {
        setErrors({ email: "Erreur lors de la réinitialisation." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Kinaru" className="h-12 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Connexion à Kinaru
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenue sur la plateforme d’administration
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
            {resetSent && (
              <p className="text-xs text-green-600 mt-1">
                Email de réinitialisation envoyé !
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                errors.password ? "border-red-400" : "border-gray-300"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-purple-800 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-primary-600 hover:underline text-sm"
            type="button"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </div>
    </div>
  );
}
