// components/properties/PropertyCard.tsx
import React, { useState } from "react";
import {
  Edit,
  Check,
  X,
  Eye,
  Trash2, // Added Trash icon for delete
} from "lucide-react";
import { FirestoreProperty } from "../../types"; // Adjust path as needed

const statusMap: { [key: number]: string } = {
  0: "libre",
  1: "occupe",
  2: "reserve",
};

interface PropertyCardProps {
  property: FirestoreProperty;
  onAction: (action: string) => void;
  loading: boolean;
  setSelectedProperty: React.Dispatch<React.SetStateAction<FirestoreProperty | null>>;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onAction,
  loading,
  setSelectedProperty,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onAction("delete"); // Triggers thunk to set delete_at
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={property.images[0] || "https://via.placeholder.com/400x200"}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4 flex space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.nomType.toLowerCase().includes("appartement")
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {property.nomType}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusMap[property.statut] === "libre"
                  ? "bg-green-100 text-green-800"
                  : statusMap[property.statut] === "occupe"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {statusMap[property.statut]}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.validationStatus === "accepte"
                  ? "bg-green-100 text-green-800"
                  : property.validationStatus === "rejete"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {property.validationStatus === "accepte"
                ? "Validé"
                : property.validationStatus === "rejete"
                ? "Rejeté"
                : "En attente"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                {/* Assuming MapPin is imported or use a placeholder */}
                <span className="w-4 h-4 mr-1">📍</span>
                {`${property.adresse}, ${property.quartier}, ${property.ville}`}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-orange-600 font-bold text-xl">
                {/* Assuming DollarSign is imported or use a placeholder */}
                <span className="w-5 h-5 mr-1">💰</span>
                {property.prix.toLocaleString()} {property.devise}/
                {property.frequence}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {property.surface}m²
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Créé le {new Date(property.created_at).toLocaleDateString()}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedProperty(property)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Voir détails"
                disabled={loading}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAction("edit")}
                className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                title="Modifier"
                disabled={loading}
              >
                <Edit className="w-4 h-4" />
              </button>
              {property.validationStatus === "en_attente" && (
                <>
                  <button
                    onClick={() => onAction("approve")}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                    title="Valider"
                    disabled={loading}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAction("reject")}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Rejeter"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              {/* Add cancel button if needed for annulation */}
              {property.validationStatus === "accepte" && (
                <button
                  onClick={() => onAction("cancel")}
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  title="Annuler"
                  disabled={loading}
                >
                  {/* Use a cancel icon if available */}
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Delete button */}
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Supprimer"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Confirmer la suppression
                </h3>
                <button
                  onClick={cancelDelete}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la propriété "{property.title}" ? Cette action est irréversible et marquera la propriété comme supprimée.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;