// components/CommercialProperties/CommercialPropertiesList.tsx
import React from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CommercialPropertyCard from '../commercials/commercial-properties-card';

const ResidentialsPropertiesList: React.FC = () => {
  const { list: commercialProperties, loading, error } = useAppSelector((state) => state.commercialProperties);
  const [searchTerm, setSearchTerm] = React.useState('');


  const filteredProperties = commercialProperties.filter(property =>
    property.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Propriétés Usage Commercial
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredProperties.length} propriétés trouvées
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <CommercialPropertyCard
            key={property.id}
            property={property}
            onAction={(action) => {
              // Handle actions: edit, delete, etc.
              console.log(`Action ${action} on ${property.id}`);
            }}
            loading={loading}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucune propriété trouvée</p>
        </div>
      )}
    </div>
  );
};

export default ResidentialsPropertiesList;