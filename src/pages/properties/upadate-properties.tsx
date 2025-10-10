import React, { useState, useEffect } from "react";
import { Save, XCircle, X, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import collections from "../../utils/firebaseCollections";
import { FirestoreProperty } from "../../types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebaseConfig";

const PropertyEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FirestoreProperty | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Charger les données
  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const propertyDoc = doc(db, collections.PROPRIETES, id);
        const propertySnapshot = await getDoc(propertyDoc);
        if (propertySnapshot.exists()) {
          setFormData({ id, ...propertySnapshot.data() } as FirestoreProperty);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la propriété:", error);
      }
    };
    fetchProperty();
  }, [id]);

  // Validation
  const validateForm = () => {
    if (!formData) return {};
    const newErrors: { [key: string]: string } = {};
    if (!formData.title?.trim()) newErrors.title = "Le titre est requis";
    if (!formData.description?.trim())
      newErrors.description = "La description est requise";
    if (formData.prix <= 0) newErrors.prix = "Le prix doit être supérieur à 0";
    if (!formData.adresse?.trim()) newErrors.adresse = "L'adresse est requise";
    if (!formData.ville?.trim()) newErrors.ville = "La ville est requise";
    if (!formData.nomType?.trim())
      newErrors.nomType = "Le type de propriété est requis";
    return newErrors;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    setLoading(true);
    try {
      // Upload des nouvelles images
      const uploadedImageUrls = [];
      for (const file of newImages) {
        const storageRef = ref(storage, `properties/${id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedImageUrls.push(url);
      }

      // Mise à jour du document
      const propertyDoc = doc(db, collections.PROPRIETES, id);
      const updatedData = {
        ...formData,
        updated_at: new Date().toISOString(),
        statut: Number(formData.statut),
        etat: Number(formData.etat),
        favorite: Number(formData.favorite),
        prix: Number(formData.prix),
        images: [...(formData.images || []), ...uploadedImageUrls],
      };

      await updateDoc(propertyDoc, updatedData);
      navigate("/properties");
    } catch (error) {
      console.error("Erreur update:", error);
      setErrors({ submit: "Erreur lors de la mise à jour de la propriété" });
    } finally {
      setLoading(false);
    }
  };

  // Handle inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "number") val = Number(value);
    if (type === "checkbox")
      val = (e.target as HTMLInputElement).checked ? 1 : 0;
    setFormData((prev) => ({ ...prev!, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle position lat/lng
  const handlePositionChange = (field: "lat" | "lng", value: string) => {
    // if (!formData) return;
    // setFormData((prev) => {
    //   if (!prev) return prev;
    //   return {
    //     ...prev,
    //     position: {
    //       lat: field === "lat" ? Number(value) : prev.position?.lat ?? 0,
    //       lng: field === "lng" ? Number(value) : prev.position?.lng ?? 0,
    //     },
    //   };
    // });
  };

  // Fonction pour supprimer une image existante
  const handleDeleteImage = (indexToDelete: number) => {
    if (!formData) return;
    setFormData((prev) => {
      if (!prev) return prev;
      const updatedImages = prev.images.filter(
        (_, index) => index !== indexToDelete
      );
      return { ...prev, images: updatedImages };
    });
  };

  // Fonction pour ajouter de nouvelles images
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  const inputStyle =
    "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white";
  const labelStyle =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const textareaStyle = `${inputStyle} min-h-[100px]`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Modifier la propriété
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Titre */}
        <div>
          <label className={labelStyle}>Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputStyle}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={textareaStyle}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Type de propriété (nomType) */}
        <div>
          <label className={labelStyle}>Type de propriété</label>
          <select
            name="nomType"
            value={formData.nomType}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value="">Sélectionner un type</option>
            <option value="Appartement moderne">Appartement moderne</option>
            <option value="Maison individuelle">Maison individuelle</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            {/* Ajoute d'autres types si nécessaire */}
          </select>
          {errors.nomType && (
            <p className="text-sm text-red-500 mt-1">{errors.nomType}</p>
          )}
        </div>

        {/* Statut */}
        <div>
          <label className={labelStyle}>Statut</label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value={0}>Libre</option>
            <option value={1}>Occupé</option>
            <option value={2}>Réservé</option>
          </select>
        </div>

        {/* État */}
        <div>
          <label className={labelStyle}>État</label>
          <select
            name="etat"
            value={formData.etat}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value={1}>Actif</option>
            <option value={0}>Inactif</option>
          </select>
        </div>

        {/* Validation Status */}
        <div>
          <label className={labelStyle}>Statut de validation</label>
          <select
            name="validationStatus"
            value={formData.validationStatus}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value="en_attente">En attente</option>
            <option value="accepte">Accepté</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>

        {/* Prix */}
        <div>
          <label className={labelStyle}>Prix</label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            className={inputStyle}
          />
          {errors.prix && (
            <p className="text-sm text-red-500 mt-1">{errors.prix}</p>
          )}
        </div>

        {/* Devise */}
        <div>
          <label className={labelStyle}>Devise</label>
          <input
            type="text"
            name="devise"
            value={formData.devise}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Fréquence */}
        <div>
          <label className={labelStyle}>Fréquence</label>
          <input
            type="text"
            name="frequence"
            value={formData.frequence}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className={inputStyle}
          />
          {errors.adresse && (
            <p className="text-sm text-red-500 mt-1">{errors.adresse}</p>
          )}
        </div>

        {/* Arrondissement */}
        <div>
          <label className={labelStyle}>Arrondissement</label>
          <input
            type="text"
            name="arrondissement"
            value={formData.arrondissement}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Quartier */}
        <div>
          <label className={labelStyle}>Quartier</label>
          <input
            type="text"
            name="quartier"
            value={formData.quartier}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Ville */}
        <div>
          <label className={labelStyle}>Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className={inputStyle}
          />
          {errors.ville && (
            <p className="text-sm text-red-500 mt-1">{errors.ville}</p>
          )}
        </div>

        {/* Région */}
        <div>
          <label className={labelStyle}>Région</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Pays */}
        <div>
          <label className={labelStyle}>Pays</label>
          <input
            type="text"
            name="pays"
            value={formData.pays}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Nombre de pièces */}
        <div>
          <label className={labelStyle}>Nombre de pièces</label>
          <input
            type="text"
            name="nombrePieces"
            value={formData.nombrePieces}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Nombre de salles de bain */}
        <div>
          <label className={labelStyle}>Nombre de salles de bain</label>
          <input
            type="text"
            name="nombreSalleBains"
            value={formData.nombreSalleBains}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Surface */}
        <div>
          <label className={labelStyle}>Surface (m²)</label>
          <input
            type="text"
            name="surface"
            value={formData.surface}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Usage */}
        <div>
          <label className={labelStyle}>Usage</label>
          <input
            type="text"
            name="usage"
            value={formData.usage}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Favori */}
        <div>
          <label className={labelStyle}>Favori</label>
          <select
            name="favorite"
            value={formData.favorite}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value={0}>Non</option>
            <option value={1}>Oui</option>
          </select>
        </div>

        {/* Certificat */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Certificat (URL)</label>
          <input
            type="text"
            name="certificate"
            value={formData.certificate || ""}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {/* Section des images existantes */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Images actuelles</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData?.images?.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Property ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section pour ajouter de nouvelles images */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Ajouter des images</label>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                Cliquez ou glissez des images
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddImages}
                className="hidden"
              />
            </label>

            {/* Prévisualisation des nouvelles images */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
        )}
      </form>
    </div>
  );
};

export default PropertyEditForm;
