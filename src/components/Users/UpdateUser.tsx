import React, { useState, useEffect } from "react";
import { Save, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import collections from "../../utils/firebaseCollections";

interface FirestoreUser {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  etat: number;
  created_at: string;
  updated_at: string;
  CNIDateDelivrer?: string;
  cniExpirationDate?: string;
  cniNumber?: string;
  cniRecto?: string;
  cniVerso?: string;
  addresse?: string;
  photoProfil?: string;
  statut?: number;
  typeUsersId?: number;
  notificationPrefs?: any;
  fcmToken?: string;
  messages?: boolean;
  newProperties?: boolean;
  payments?: boolean;
  reservations?: boolean;
  visits?: boolean;
}

const UserEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FirestoreUser | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Charger les données
  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const userDoc = doc(db, collections.USERS, id);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setFormData({ uid: id, ...userSnapshot.data() } as FirestoreUser);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l’utilisateur:", error);
      }
    };
    fetchUser();
  }, [id]);

  // Validation
  const validateForm = () => {
    if (!formData) return {};
    const newErrors: { [key: string]: string } = {};
    if (!formData.nom?.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom?.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.email?.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide";
    }
    if (!formData.role) newErrors.role = "Le rôle est requis";
    return newErrors;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, collections.USERS, id);
      const updatedData = { ...formData, updated_at: new Date().toISOString() };
      await updateDoc(userDoc, updatedData);

      navigate("/users"); // retour à la liste
    } catch (error) {
      console.error("Erreur update:", error);
      setErrors({ submit: "Erreur lors de la mise à jour de l'utilisateur" });
    } finally {
      setLoading(false);
    }
  };

  // Handle inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "number") val = Number(value);
    if (type === "checkbox") val = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev!, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  const inputStyle = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modifier l'utilisateur</h2>
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div>
          <label className={labelStyle}>Nom</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputStyle} />
          {errors.nom && <p className="text-sm text-red-500 mt-1">{errors.nom}</p>}
        </div>

        {/* Prénom */}
        <div>
          <label className={labelStyle}>Prénom</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputStyle} />
          {errors.prenom && <p className="text-sm text-red-500 mt-1">{errors.prenom}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelStyle}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Téléphone */}
        <div>
          <label className={labelStyle}>Téléphone</label>
          <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className={inputStyle} />
        </div>

        {/* Rôle */}
        <div>
          <label className={labelStyle}>Rôle</label>
          <select name="role" value={formData.role} onChange={handleChange} className={inputStyle}>
            <option value="locataire">Locataire</option>
            <option value="proprietaire">Propriétaire</option>
            <option value="admin">Administrateur</option>
          </select>
          {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
        </div>

        {/* État */}
        <div>
          <label className={labelStyle}>État</label>
          <select name="etat" value={formData.etat} onChange={handleChange} className={inputStyle}>
            <option value={1}>Actif</option>
            <option value={0}>Inactif</option>
          </select>
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Adresse</label>
          <input type="text" name="addresse" value={formData.addresse || ""} onChange={handleChange} className={inputStyle} />
        </div>

        {/* CNI */}
        <div>
          <label className={labelStyle}>Numéro CNI</label>
          <input type="text" name="cniNumber" value={formData.cniNumber || ""} onChange={handleChange} className={inputStyle} />
        </div>

        <div>
          <label className={labelStyle}>Date de délivrance CNI</label>
          <input type="text" name="CNIDateDelivrer" value={formData.CNIDateDelivrer || ""} onChange={handleChange} className={inputStyle} />
        </div>

        <div>
          <label className={labelStyle}>Date d'expiration CNI</label>
          <input type="text" name="cniExpirationDate" value={formData.cniExpirationDate || ""} onChange={handleChange} className={inputStyle} />
        </div>

        {/* Photo profil */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Photo Profil (URL)</label>
          <input type="text" name="photoProfil" value={formData.photoProfil || ""} onChange={handleChange} className={inputStyle} />
        </div>

        {/* Notifications */}
        <div>
          <label className={labelStyle}>Messages</label>
          <select name="messages" value={formData.messages ? 1 : 0} onChange={handleChange} className={inputStyle}>
            <option value={1}>Oui</option>
            <option value={0}>Non</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Nouvelles propriétés</label>
          <select name="newProperties" value={formData.newProperties ? 1 : 0} onChange={handleChange} className={inputStyle}>
            <option value={1}>Oui</option>
            <option value={0}>Non</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Réservations</label>
          <select name="reservations" value={formData.reservations ? 1 : 0} onChange={handleChange} className={inputStyle}>
            <option value={1}>Oui</option>
            <option value={0}>Non</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Visites</label>
          <select name="visits" value={formData.visits ? 1 : 0} onChange={handleChange} className={inputStyle}>
            <option value={1}>Oui</option>
            <option value={0}>Non</option>
          </select>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex space-x-3 pt-4">
          <button type="submit" disabled={loading} className={`flex-1 flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
          </button>
          <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
            Annuler
          </button>
        </div>

        {errors.submit && <p className="text-sm text-red-500 mt-4">{errors.submit}</p>}
      </form>
    </div>
  );
};

export default UserEditForm;
