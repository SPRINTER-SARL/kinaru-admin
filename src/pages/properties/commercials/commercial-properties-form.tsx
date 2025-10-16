// components/CommercialProperties/CommercialPropertiesForm.tsx (Add/Edit form, inspired from PropertyAddForm)
import React, { useState, useEffect } from "react";
import { Save, XCircle, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAppSelector } from "../../../store/hooks";
import collections from "../../../utils/firebaseCollections";
import { CommercialProperty } from "./commercialPropertiesSlice";
import { db } from "../../../firebase/firebaseConfig";

const CommercialPropertiesForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // For edit mode
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<CommercialProperty>>({
    nom: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]); // If images needed

  // Load data for edit
  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const propertyDoc = doc(db, collections.PROPRIETES_USAGE_COMMERCIAL || 'PropriétésUsageCommercial', id);
        const propertySnapshot = await getDoc(propertyDoc);
        if (propertySnapshot.exists()) {
          setFormData({ ...propertySnapshot.data() } as Partial<CommercialProperty>);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      }
    };
    fetchProperty();
  }, [id]);

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nom?.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.description?.trim()) newErrors.description = "La description est requise";
    return newErrors;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        // Update
        const propertyRef = doc(db, collections.PROPRIETES_USAGE_COMMERCIAL || 'PropriétésUsageCommercial', id);
        await updateDoc(propertyRef, {
          ...formData,
          updated_at: serverTimestamp(),
        });
      } else {
        // Add
        const propertiesRef = collection(db, collections.PROPRIETES_USAGE_COMMERCIAL || 'PropriétésUsageCommercial');
        await addDoc(propertiesRef, {
          ...formData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }
      navigate('/commercial-properties'); // Adjust route
    } catch (error) {
      console.error("Erreur:", error);
      setErrors({ submit: "Erreur lors de l'opération" });
    } finally {
      setLoading(false);
    }
  };

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev!, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const inputStyle = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const textareaStyle = `${inputStyle} min-h-[100px]`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Modifier' : 'Ajouter'} Propriété Usage Commercial
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom */}
        <div>
          <label className={labelStyle}>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom || ""}
            onChange={handleChange}
            className={inputStyle}
          />
          {errors.nom && <p className="text-sm text-red-500 mt-1">{errors.nom}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelStyle}>Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className={textareaStyle}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Images (if needed, similar to add form) */}
        <div>
          <label className={labelStyle}>Images (optionnel)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Ajouter"}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>

        {errors.submit && <p className="text-sm text-red-500 mt-4">{errors.submit}</p>}
      </form>
    </div>
  );
};

export default CommercialPropertiesForm;