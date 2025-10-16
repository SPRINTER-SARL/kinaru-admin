// components/CommercialProperties/CommercialPropertyCard.tsx (Inspired from PropertyCard)
import React, { useState } from 'react';
import { Edit, Trash2, Eye, X } from 'lucide-react';
import { CommercialProperty } from './commercialPropertiesSlice';

interface CommercialPropertyCardProps {
  property: CommercialProperty;
  onAction: (action: string) => void;
  loading: boolean;
}

const CommercialPropertyCard: React.FC<CommercialPropertyCardProps> = ({
  property,
  onAction,
  loading,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => setShowDeleteModal(true);
  const confirmDelete = () => {
    onAction('delete');
    setShowDeleteModal(false);
  };
  const cancelDelete = () => setShowDeleteModal(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
            {property.nom}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {property.description}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Créé le {new Date(property.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAction('view')}
              className="p-2 text-gray-400 hover:text-blue-500"
              title="Voir détails"
              disabled={loading}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAction('edit')}
              className="p-2 text-gray-400 hover:text-orange-500"
              title="Modifier"
              disabled={loading}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-500"
              title="Supprimer"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
                Êtes-vous sûr de vouloir supprimer "{property.nom}" ? Cette action est irréversible.
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

export default CommercialPropertyCard;