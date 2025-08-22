import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Transaction,
  type WriteBatch,
  type OrderByDirection,
  type WhereFilterOp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut,
  getIdToken,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type UploadTaskSnapshot,
  type StorageReference,
  type FirebaseStorage,
} from "firebase/storage";
import { auth, db, storage, googleProvider } from "./firebaseConfig";

// Fonctions utilitaires
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidString = (str: string): boolean => typeof str === "string" && str.trim().length > 0;

/* =========================
 * AUTHENTIFICATION
 * ========================= */

/**
 * Crée un compte utilisateur avec email et mot de passe.
 * @param email - Adresse email de l'utilisateur.
 * @param password - Mot de passe.
 * @param displayName - Nom d'affichage optionnel.
 * @returns L'objet utilisateur créé.
 */
export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  if (!isValidString(password)) throw new Error("Le mot de passe ne peut pas être vide");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    return user;
  } catch (error: any) {
    throw new Error(`Échec de l'inscription : ${error.message}`);
  }
};

/**
 * Connecte un utilisateur avec email et mot de passe.
 * @param email - Adresse email de l'utilisateur.
 * @param password - Mot de passe de l'utilisateur.
 * @returns L'objet UserCredential de Firebase.
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  if (!isValidString(password)) throw new Error("Le mot de passe ne peut pas être vide");

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(`Échec de la connexion : ${error.message}`);
  }
};

/**
 * Connecte un utilisateur via Google OAuth avec une fenêtre popup.
 * @returns L'objet UserCredential de Firebase.
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    throw new Error(`Échec de la connexion Google : ${error.message}`);
  }
};

/**
 * Déconnecte l'utilisateur actuel.
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Échec de la déconnexion : ${error.message}`);
  }
};

/**
 * Écoute les changements d'état d'authentification.
 * @param callback - Fonction appelée avec l'utilisateur actuel ou null.
 * @returns Fonction pour arrêter l'écoute.
 */
export const onAuthChanged = (callback: (user: User | null) => void): Unsubscribe => {
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");
  return onAuthStateChanged(auth, callback);
};

/**
 * Envoie un email de réinitialisation de mot de passe.
 * @param email - Adresse email de l'utilisateur.
 */
export const sendReset = async (email: string): Promise<void> => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(`Échec de la réinitialisation du mot de passe : ${error.message}`);
  }
};

/**
 * Met à jour le nom d'affichage de l'utilisateur actuel.
 * @param displayName - Nouveau nom d'affichage.
 * @returns Résolu si mis à jour, null si aucun utilisateur connecté.
 */
export const updateUserDisplayName = async (displayName: string): Promise<void | null> => {
  if (!auth.currentUser) return null;
  if (!isValidString(displayName)) throw new Error("Le nom d'affichage ne peut pas être vide");
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error: any) {
    throw new Error(`Échec de la mise à jour du nom d'affichage : ${error.message}`);
  }
};

/**
 * Récupère le jeton d'identification de l'utilisateur actuel.
 * @returns Le jeton ou null si aucun utilisateur connecté.
 */
export const getCurrentUserToken = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;
  try {
    return await getIdToken(auth.currentUser, true);
  } catch (error: any) {
    throw new Error(`Échec de la récupération du jeton : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - CRUD de base
 * ========================= */

/**
 * Ajoute un nouveau document à une collection Firestore.
 * @param collectionName - Nom de la collection.
 * @param data - Données à stocker dans le document.
 * @returns L'ID du document créé.
 */
export const addDocument = async <T extends DocumentData>(collectionName: string, data: T): Promise<string> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    const colRef: CollectionReference<T> = collection(db, collectionName) as CollectionReference<T>;
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as T);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Échec de l'ajout du document : ${error.message}`);
  }
};

/**
 * Définit ou fusionne un document avec un ID spécifique.
 * @param collectionName - Nom de la collection.
 * @param id - ID du document.
 * @param data - Données à stocker ou fusionner.
 * @param merge - Fusionner avec les données existantes ou remplacer.
 * @returns L'ID du document.
 */
export const setDocument = async <T extends DocumentData>(collectionName: string, id: string, data: Partial<T>, merge: boolean = true): Promise<string> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    const docRef: DocumentReference<T> = doc(db, collectionName, id) as DocumentReference<T>;
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt ?? serverTimestamp(),
      } as Partial<T>,
      { merge }
    );
    return id;
  } catch (error: any) {
    throw new Error(`Échec de la définition du document : ${error.message}`);
  }
};

/**
 * Récupère un document par son ID.
 * @param collectionName - Nom de la collection.
 * @param id - ID du document.
 * @returns Les données du document avec l'ID, ou null.
 */
export const getDocumentById = async <T extends DocumentData>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");

  try {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T & { id: string }) : null;
  } catch (error: any) {
    throw new Error(`Échec de la récupération du document : ${error.message}`);
  }
};

/**
 * Récupère tous les documents d'une collection.
 * @param collectionName - Nom de la collection.
 * @returns Un tableau de documents avec leurs IDs.
 */
export const getCollection = async <T extends DocumentData>(collectionName: string): Promise<(T & { id: string })[]> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
  } catch (error: any) {
    throw new Error(`Échec de la récupération de la collection : ${error.message}`);
  }
};

/**
 * Met à jour un document avec les données fournies.
 * @param collectionName - Nom de la collection.
 * @param id - ID du document.
 * @param data - Données à mettre à jour.
 * @returns L'ID du document.
 */
export const updateDocument = async <T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<string> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error: any) {
    throw new Error(`Échec de la mise à jour du document : ${error.message}`);
  }
};

/**
 * Supprime un document par son ID.
 * @param collectionName - Nom de la collection.
 * @param id - ID du document.
 */
export const deleteDocumentById = async (collectionName: string, id: string): Promise<void> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");

  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error: any) {
    throw new Error(`Échec de la suppression du document : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - Requêtes avancées
 * ========================= */

// Types pour les options de requête
interface QueryOptions<T> {
  collectionName: string;
  conditions?: Array<{ field: keyof T, op: WhereFilterOp, value: any }>;
  orders?: Array<{ field: keyof T, direction: OrderByDirection }>;
  pageSize?: number;
  startAfterDoc?: QueryDocumentSnapshot;
}

/**
 * Requête une collection Firestore avec conditions, tri et pagination.
 * @param options - Options de la requête.
 * @returns Résultats et dernier document visible pour la pagination.
 */
export const queryCollection = async <T extends DocumentData>({
  collectionName,
  conditions = [],
  orders = [],
  pageSize,
  startAfterDoc,
}: QueryOptions<T>): Promise<{ data: (T & { id: string })[]; lastVisible: QueryDocumentSnapshot | null }> => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (pageSize && (!Number.isInteger(pageSize) || pageSize <= 0)) {
    throw new Error("Taille de page invalide");
  }

  try {
    let q: Query<T> = collection(db, collectionName) as Query<T>;

    if (conditions.length) {
      const whereClauses = conditions.map((c) => where(c.field as string, c.op, c.value));
      q = query(q, ...whereClauses);
    }

    if (orders.length) {
      const orderClauses = orders.map((o) => orderBy(o.field as string, o.direction));
      q = query(q, ...orderClauses);
    }

    if (pageSize) {
      q = query(q, limit(pageSize));
    }

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
    const lastVisible = snap.docs[snap.docs.length - 1] || null;

    return { data, lastVisible };
  } catch (error: any) {
    throw new Error(`Échec de la requête de collection : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - Écouteurs en temps réel
 * ========================= */

/**
 * Écoute les mises à jour en temps réel d'une collection.
 * @param collectionName - Nom de la collection.
 * @param options - Options de requête (conditions, tri, taille de page).
 * @param callback - Fonction appelée avec les documents mis à jour.
 * @param errorCallback - Fonction appelée en cas d'erreur.
 * @returns Fonction pour arrêter l'écoute.
 */
export const listenToCollection = <T extends DocumentData>(
  collectionName: string,
  options: Omit<QueryOptions<T>, 'collectionName' | 'startAfterDoc'> = {},
  callback: (docs: (T & { id: string })[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");
  const { conditions = [], orders = [], pageSize } = options;

  let q: Query<T> = collection(db, collectionName) as Query<T>;

  if (conditions.length) {
    const whereClauses = conditions.map((c) => where(c.field as string, c.op, c.value));
    q = query(q, ...whereClauses);
  }

  if (orders.length) {
    const orderClauses = orders.map((o) => orderBy(o.field as string, o.direction));
    q = query(q, ...orderClauses);
  }

  if (pageSize) {
    q = query(q, limit(pageSize));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
      callback(docs);
    },
    (error) => errorCallback?.(new Error(`Échec de l'écoute de la collection : ${error.message}`))
  );
};

/**
 * Écoute les mises à jour en temps réel d'un document spécifique.
 * @param collectionName - Nom de la collection.
 * @param id - ID du document.
 * @param callback - Fonction appelée avec le document mis à jour ou null.
 * @param errorCallback - Fonction appelée en cas d'erreur.
 * @returns Fonction pour arrêter l'écoute.
 */
export const listenToDocument = <T extends DocumentData>(
  collectionName: string,
  id: string,
  callback: (doc: (T & { id: string }) | null) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");

  const docRef: DocumentReference<T> = doc(db, collectionName, id) as DocumentReference<T>;
  return onSnapshot(
    docRef,
    (docSnap) => {
      callback(docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T & { id: string }) : null);
    },
    (error) => errorCallback?.(new Error(`Échec de l'écoute du document : ${error.message}`))
  );
};

/* =========================
 * FIRESTORE - Batch & Transactions
 * ========================= */

// Type pour les opérations de lot
interface BatchOperation<T> {
  type: 'set' | 'update' | 'delete';
  ref: DocumentReference<T>;
  data?: Partial<T>;
  merge?: boolean;
}

/**
 * Exécute un lot d'opérations d'écriture Firestore.
 * @param operations - Les opérations du lot.
 */
export const runBatch = async <T extends DocumentData>(operations: BatchOperation<T>[] = []): Promise<void> => {
  if (!Array.isArray(operations) || !operations.length) {
    throw new Error("Les opérations doivent être un tableau non vide");
  }

  const batch: WriteBatch = writeBatch(db);
  operations.forEach((op) => {
    if (!["set", "update", "delete"].includes(op.type)) {
      throw new Error(`Type d'opération invalide : ${op.type}`);
    }
    if (op.type === "set") {
      if (!op.data || typeof op.data !== "object") throw new Error("Les données doivent être un objet pour set");
      batch.set(op.ref, op.data, { merge: !!op.merge });
    }
    if (op.type === "update") {
      if (!op.data || typeof op.data !== "object") throw new Error("Les données doivent être un objet pour update");
      // batch.update(op.ref, op.data); TODO come here
    }
    if (op.type === "delete") batch.delete(op.ref);
  });

  try {
    await batch.commit();
  } catch (error: any) {
    throw new Error(`Échec de l'opération de lot : ${error.message}`);
  }
};

/**
 * Exécute une transaction Firestore.
 * @param transactionFn - Fonction de transaction.
 * @returns Résultat de la transaction.
 */
export const runFsTransaction = async <T>(transactionFn: (transaction: Transaction) => Promise<T>): Promise<T> => {
  if (typeof transactionFn !== "function") throw new Error("Une fonction de transaction doit être fournie");

  try {
    return await runTransaction(db, transactionFn);
  } catch (error: any) {
    throw new Error(`Échec de la transaction : ${error.message}`);
  }
};

/* =========================
 * STORAGE
 * ========================= */

/**
 * Télécharge un fichier vers Firebase Storage et renvoie son URL.
 * @param path - Chemin de stockage du fichier.
 * @param fileOrBlob - Fichier ou Blob à télécharger.
 * @returns L'URL de téléchargement du fichier.
 */
export const uploadFile = async (path: string, fileOrBlob: File | Blob): Promise<string> => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");
  if (!(fileOrBlob instanceof File || fileOrBlob instanceof Blob)) {
    throw new Error("Un fichier ou Blob est requis");
  }

  try {
    const storageRef: StorageReference = ref(storage, path);
    await uploadBytes(storageRef, fileOrBlob);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    throw new Error(`Échec du téléchargement du fichier : ${error.message}`);
  }
};

/**
 * Télécharge un fichier vers Firebase Storage avec suivi de la progression.
 * @param path - Chemin de stockage du fichier.
 * @param fileOrBlob - Fichier ou Blob à télécharger.
 * @param onProgress - Callback de progression.
 * @returns Un objet contenant la tâche et la promesse résolue avec l'URL.
 */
export const uploadFileWithProgress = (
  path: string,
  fileOrBlob: File | Blob,
  onProgress?: (snapshot: { progress: number; state: string; transferred: number; total: number }) => void
): { task: UploadTask; promise: Promise<string> } => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");
  if (!(fileOrBlob instanceof File || fileOrBlob instanceof Blob)) {
    throw new Error("Un fichier ou Blob est requis");
  }
  if (onProgress && typeof onProgress !== "function") {
    throw new Error("onProgress doit être une fonction");
  }

  const storageRef: StorageReference = ref(storage, path);
  const task: UploadTask = uploadBytesResumable(storageRef, fileOrBlob);

  task.on(
    "state_changed",
    (snapshot: UploadTaskSnapshot) => {
      if (onProgress) {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({
          progress,
          state: snapshot.state,
          transferred: snapshot.bytesTransferred,
          total: snapshot.totalBytes,
        });
      }
    },
    (error: any) => {
      throw new Error(`Échec de la progression du téléchargement : ${error.message}`);
    }
  );

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      null,
      (error: any) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error: any) {
          reject(new Error(`Échec de la récupération de l'URL : ${error.message}`));
        }
      }
    );
  });

  return { task, promise };
};

/**
 * Récupère l'URL de téléchargement d'un fichier dans Firebase Storage.
 * @param path - Chemin de stockage du fichier.
 * @returns L'URL de téléchargement du fichier.
 */
export const getFileURL = async (path: string): Promise<string> => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");

  try {
    return await getDownloadURL(ref(storage, path));
  } catch (error: any) {
    throw new Error(`Échec de la récupération de l'URL du fichier : ${error.message}`);
  }
};

/**
 * Supprime un fichier de Firebase Storage.
 * @param path - Chemin de stockage du fichier.
 */
export const deleteFile = async (path: string): Promise<void> => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");

  try {
    await deleteObject(ref(storage, path));
  } catch (error: any) {
    throw new Error(`Échec de la suppression du fichier : ${error.message}`);
  }
};