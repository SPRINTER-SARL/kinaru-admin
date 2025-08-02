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
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage, googleProvider } from "./firebaseConfig";

// Fonction utilitaire pour valider le format d'un email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction utilitaire pour valider une chaîne de caractères
const isValidString = (str) => typeof str === "string" && str.trim().length > 0;

/* =========================
 * AUTHENTIFICATION
 * ========================= */

/**
 * Crée un compte utilisateur avec email et mot de passe, avec un nom d'affichage optionnel.
 * @param {string} email - Adresse email de l'utilisateur.
 * @param {string} password - Mot de passe (doit respecter les exigences de Firebase).
 * @param {string} [displayName] - Nom d'affichage optionnel.
 * @returns {Promise<User>} - Objet utilisateur Firebase créé.
 * @throws {Error} - Si l'email ou le mot de passe est invalide ou si l'inscription échoue.
 */
export const signUpWithEmail = async (email, password, displayName) => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  if (!isValidString(password)) throw new Error("Le mot de passe ne peut pas être vide");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (isValidString(displayName)) {
      await updateProfile(user, { displayName });
    }
    return user;
  } catch (error) {
    throw new Error(`Échec de l'inscription : ${error.message}`);
  }
};

/**
 * Connecte un utilisateur avec email et mot de passe.
 * @param {string} email - Adresse email de l'utilisateur.
 * @param {string} password - Mot de passe de l'utilisateur.
 * @returns {Promise<UserCredential>} - Objet UserCredential de Firebase.
 * @throws {Error} - Si l'email ou le mot de passe est invalide ou si la connexion échoue.
 */
export const signInWithEmail = async (email, password) => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  if (!isValidString(password)) throw new Error("Le mot de passe ne peut pas être vide");

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(`Échec de la connexion : ${error.message}`);
  }
};

/**
 * Connecte un utilisateur via Google OAuth avec une fenêtre popup.
 * @returns {Promise<UserCredential>} - Objet UserCredential de Firebase.
 * @throws {Error} - Si la connexion Google échoue.
 */
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw new Error(`Échec de la connexion Google : ${error.message}`);
  }
};

/**
 * Déconnecte l'utilisateur actuel.
 * @returns {Promise<void>} - Résolu lorsque la déconnexion est terminée.
 * @throws {Error} - Si la déconnexion échoue.
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Échec de la déconnexion : ${error.message}`);
  }
};

/**
 * Écoute les changements d'état d'authentification.
 * @param {function(User|null)} callback - Fonction appelée avec l'utilisateur actuel ou null.
 * @returns {function} - Fonction pour arrêter l'écoute.
 * @throws {Error} - Si le callback n'est pas une fonction.
 */
export const onAuthChanged = (callback) => {
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");
  return onAuthStateChanged(auth, callback);
};

/**
 * Envoie un email de réinitialisation de mot de passe.
 * @param {string} email - Adresse email de l'utilisateur.
 * @returns {Promise<void>} - Résolu lorsque l'email est envoyé.
 * @throws {Error} - Si l'email est invalide ou si l'envoi échoue.
 */
export const sendReset = async (email) => {
  if (!isValidEmail(email)) throw new Error("Format d'email invalide");
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(`Échec de la réinitialisation du mot de passe : ${error.message}`);
  }
};

/**
 * Met à jour le nom d'affichage de l'utilisateur actuel.
 * @param {string} displayName - Nouveau nom d'affichage.
 * @returns {Promise<void|null>} - Résolu si mis à jour, null si aucun utilisateur connecté.
 * @throws {Error} - Si la mise à jour échoue ou si l'entrée est invalide.
 */
export const updateUserDisplayName = async (displayName) => {
  if (!auth.currentUser) return null;
  if (!isValidString(displayName)) throw new Error("Le nom d'affichage ne peut pas être vide");
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error) {
    throw new Error(`Échec de la mise à jour du nom d'affichage : ${error.message}`);
  }
};

/**
 * Récupère le jeton d'identification de l'utilisateur actuel.
 * @returns {Promise<string|null>} - Le jeton ou null si aucun utilisateur connecté.
 * @throws {Error} - Si la récupération du jeton échoue.
 */
export const getCurrentUserToken = async () => {
  if (!auth.currentUser) return null;
  try {
    return await getIdToken(auth.currentUser, true);
  } catch (error) {
    throw new Error(`Échec de la récupération du jeton : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - CRUD de base
 * ========================= */

/**
 * Ajoute un nouveau document à une collection Firestore avec des horodatages.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {object} data - Données à stocker dans le document.
 * @returns {Promise<string>} - ID du document créé.
 * @throws {Error} - Si le nom de la collection est invalide ou si l'opération échoue.
 */
export const addDocument = async (collectionName, data) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Échec de l'ajout du document : ${error.message}`);
  }
};

/**
 * Définit ou fusionne un document avec un ID spécifique dans une collection.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {string} id - ID du document.
 * @param {object} data - Données à stocker ou fusionner.
 * @param {boolean} [merge=true] - Fusionner avec les données existantes ou remplacer.
 * @returns {Promise<string>} - ID du document.
 * @throws {Error} - Si les entrées sont invalides ou si l'opération échoue.
 */
export const setDocument = async (collectionName, id, data, merge = true) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt ?? serverTimestamp(),
      },
      { merge }
    );
    return id;
  } catch (error) {
    throw new Error(`Échec de la définition du document : ${error.message}`);
  }
};

/**
 * Récupère un document par son ID.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {string} id - ID du document.
 * @returns {Promise<object|null>} - Données du document avec ID, ou null si non trouvé.
 * @throws {Error} - Si les entrées sont invalides ou si l'opération échoue.
 */
export const getDocumentById = async (collectionName, id) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");

  try {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw new Error(`Échec de la récupération du document : ${error.message}`);
  }
};

/**
 * Récupère tous les documents d'une collection.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @returns {Promise<object[]>} - Tableau de documents avec leurs IDs.
 * @throws {Error} - Si le nom de la collection est invalide ou si l'opération échoue.
 */
export const getCollection = async (collectionName) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error(`Échec de la récupération de la collection : ${error.message}`);
  }
};

/**
 * Met à jour un document avec les données fournies.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {string} id - ID du document.
 * @param {object} data - Données à mettre à jour.
 * @returns {Promise<string>} - ID du document.
 * @throws {Error} - Si les entrées sont invalides ou si l'opération échoue.
 */
export const updateDocument = async (collectionName, id, data) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (!data || typeof data !== "object") throw new Error("Les données doivent être un objet");

  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    throw new Error(`Échec de la mise à jour du document : ${error.message}`);
  }
};

/**
 * Supprime un document par son ID.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {string} id - ID du document.
 * @returns {Promise<void>} - Résolu lorsque la suppression est terminée.
 * @throws {Error} - Si les entrées sont invalides ou si l'opération échoue.
 */
export const deleteDocumentById = async (collectionName, id) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");

  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    throw new Error(`Échec de la suppression du document : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - Requêtes avancées
 * ========================= */

/**
 * Requête une collection Firestore avec conditions, tri et pagination.
 * @param {object} options - Options de la requête.
 * @param {string} options.collectionName - Nom de la collection Firestore.
 * @param {Array<{field: string, op: string, value: any}>} [options.conditions=[]] - Conditions de filtrage.
 * @param {Array<{field: string, direction: 'asc'|'desc'}>} [options.orders=[]] - Options de tri.
 * @param {number} [options.pageSize] - Nombre de documents à récupérer.
 * @param {QueryDocumentSnapshot} [options.startAfterDoc] - Document de départ pour la pagination.
 * @returns {Promise<{data: object[], lastVisible: QueryDocumentSnapshot|null}>} - Résultats et dernier document visible.
 * @throws {Error} - Si les entrées sont invalides ou si la requête échoue.
 */
export const queryCollection = async ({
  collectionName,
  conditions = [],
  orders = [],
  pageSize,
  startAfterDoc,
}) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (pageSize && (!Number.isInteger(pageSize) || pageSize <= 0)) {
    throw new Error("Taille de page invalide");
  }
  if (conditions.some((c) => !isValidString(c.field) || !isValidString(c.op))) {
    throw new Error("Conditions de requête invalides");
  }
  if (orders.some((o) => !isValidString(o.field) || !["asc", "desc"].includes(o.direction))) {
    throw new Error("Conditions de tri invalides");
  }

  try {
    let q = collection(db, collectionName);

    // Applique les clauses where
    if (conditions.length) {
      const whereClauses = conditions.map((c) => where(c.field, c.op, c.value));
      q = query(q, ...whereClauses);
    }

    // Applique les clauses orderBy
    if (orders.length) {
      const orderClauses = orders.map((o) => orderBy(o.field, o.direction || "asc"));
      q = query(q, ...orderClauses);
    }

    // Applique la limite
    if (pageSize) {
      q = query(q, limit(pageSize));
    }

    // Applique la pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lastVisible = snap.docs[snap.docs.length - 1] || null;

    return { data, lastVisible };
  } catch (error) {
    throw new Error(`Échec de la requête de collection : ${error.message}`);
  }
};

/* =========================
 * FIRESTORE - Écouteurs en temps réel
 * ========================= */

/**
 * Écoute les mises à jour en temps réel d'une collection Firestore.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {object} options - Options de requête (conditions, tri, taille de page).
 * @param {function(object[])} callback - Fonction appelée avec les documents mis à jour.
 * @param {function(Error)} errorCallback - Fonction appelée en cas d'erreur.
 * @returns {function} - Fonction pour arrêter l'écoute.
 * @throws {Error} - Si les entrées sont invalides.
 */
export const listenToCollection = (
  collectionName,
  { conditions = [], orders = [], pageSize } = {},
  callback,
  errorCallback
) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");
  if (pageSize && (!Number.isInteger(pageSize) || pageSize <= 0)) {
    throw new Error("Taille de page invalide");
  }

  let q = collection(db, collectionName);

  if (conditions.length) {
    const whereClauses = conditions.map((c) => where(c.field, c.op, c.value));
    q = query(q, ...whereClauses);
  }

  if (orders.length) {
    const orderClauses = orders.map((o) => orderBy(o.field, o.direction || "asc"));
    q = query(q, ...orderClauses);
  }

  if (pageSize) {
    q = query(q, limit(pageSize));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(docs);
    },
    (error) => errorCallback?.(new Error(`Échec de l'écoute de la collection : ${error.message}`))
  );
};

/**
 * Écoute les mises à jour en temps réel d'un document spécifique.
 * @param {string} collectionName - Nom de la collection Firestore.
 * @param {string} id - ID du document.
 * @param {function(object|null)} callback - Fonction appelée avec le document mis à jour ou null.
 * @param {function(Error)} errorCallback - Fonction appelée en cas d'erreur.
 * @returns {function} - Fonction pour arrêter l'écoute.
 * @throws {Error} - Si les entrées sont invalides.
 */
export const listenToDocument = (collectionName, id, callback, errorCallback) => {
  if (!isValidString(collectionName)) throw new Error("Nom de collection invalide");
  if (!isValidString(id)) throw new Error("ID de document invalide");
  if (typeof callback !== "function") throw new Error("Le callback doit être une fonction");

  const docRef = doc(db, collectionName, id);
  return onSnapshot(
    docRef,
    (docSnap) => {
      callback(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
    },
    (error) => errorCallback?.(new Error(`Échec de l'écoute du document : ${error.message}`))
  );
};

/* =========================
 * FIRESTORE - Batch & Transactions
 * ========================= */

/**
 * Exécute un lot d'opérations d'écriture Firestore.
 * @param {Array<{type: 'set'|'update'|'delete', ref: DocumentReference, data?: object, merge?: boolean}>} operations - Opérations du lot.
 * @returns {Promise<void>} - Résolu lorsque le lot est validé.
 * @throws {Error} - Si les opérations sont invalides ou si la validation échoue.
 */
export const runBatch = async (operations = []) => {
  if (!Array.isArray(operations) || !operations.length) {
    throw new Error("Les opérations doivent être un tableau non vide");
  }

  const batch = writeBatch(db);
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
      batch.update(op.ref, op.data);
    }
    if (op.type === "delete") batch.delete(op.ref);
  });

  try {
    await batch.commit();
  } catch (error) {
    throw new Error(`Échec de l'opération de lot : ${error.message}`);
  }
};

/**
 * Exécute une transaction Firestore.
 * @param {function(Transaction): Promise<void>} transactionFn - Fonction de transaction.
 * @returns {Promise<any>} - Résultat de la transaction.
 * @throws {Error} - Si la transaction échoue ou si l'entrée est invalide.
 */
export const runFsTransaction = async (transactionFn) => {
  if (typeof transactionFn !== "function") throw new Error("Une fonction de transaction doit être fournie");

  try {
    return await runTransaction(db, transactionFn);
  } catch (error) {
    throw new Error(`Échec de la transaction : ${error.message}`);
  }
};

/* =========================
 * STORAGE
 * ========================= */

/**
 * Télécharge un fichier vers Firebase Storage et renvoie son URL de téléchargement.
 * @param {string} path - Chemin de stockage du fichier.
 * @param {File|Blob} fileOrBlob - Fichier ou Blob à télécharger.
 * @returns {Promise<string>} - URL de téléchargement du fichier.
 * @throws {Error} - Si les entrées sont invalides ou si le téléchargement échoue.
 */
export const uploadFile = async (path, fileOrBlob) => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");
  if (!(fileOrBlob instanceof File || fileOrBlob instanceof Blob)) {
    throw new Error("Un fichier ou Blob est requis");
  }

  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, fileOrBlob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw new Error(`Échec du téléchargement du fichier : ${error.message}`);
  }
};

/**
 * Télécharge un fichier vers Firebase Storage avec suivi de la progression.
 * @param {string} path - Chemin de stockage du fichier.
 * @param {File|Blob} fileOrBlob - Fichier ou Blob à télécharger.
 * @param {function({progress: number, state: string, transferred: number, total: number})} onProgress - Callback de progression.
 * @returns {{task: UploadTask, promise: Promise<string>}} - Tâche de téléchargement et promesse résolue avec l'URL.
 * @throws {Error} - Si les entrées sont invalides ou si le téléchargement échoue.
 */
export const uploadFileWithProgress = (path, fileOrBlob, onProgress) => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");
  if (!(fileOrBlob instanceof File || fileOrBlob instanceof Blob)) {
    throw new Error("Un fichier ou Blob est requis");
  }
  if (onProgress && typeof onProgress !== "function") {
    throw new Error("onProgress doit être une fonction");
  }

  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, fileOrBlob);

  task.on(
    "state_changed",
    (snapshot) => {
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
    (error) => {
      throw new Error(`Échec de la progression du téléchargement : ${error.message}`);
    }
  );

  const promise = new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      null,
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(new Error(`Échec de la récupération de l'URL : ${error.message}`));
        }
      }
    );
  });

  return { task, promise };
};

/**
 * Récupère l'URL de téléchargement d'un fichier dans Firebase Storage.
 * @param {string} path - Chemin de stockage du fichier.
 * @returns {Promise<string>} - URL de téléchargement du fichier.
 * @throws {Error} - Si le chemin est invalide ou si la récupération échoue.
 */
export const getFileURL = async (path) => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");

  try {
    return await getDownloadURL(ref(storage, path));
  } catch (error) {
    throw new Error(`Échec de la récupération de l'URL du fichier : ${error.message}`);
  }
};

/**
 * Supprime un fichier de Firebase Storage.
 * @param {string} path - Chemin de stockage du fichier.
 * @returns {Promise<void>} - Résolu lorsque la suppression est terminée.
 * @throws {Error} - Si le chemin est invalide ou si la suppression échoue.
 */
export const deleteFile = async (path) => {
  if (!isValidString(path)) throw new Error("Chemin de stockage invalide");

  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    throw new Error(`Échec de la suppression du fichier : ${error.message}`);
  }
};