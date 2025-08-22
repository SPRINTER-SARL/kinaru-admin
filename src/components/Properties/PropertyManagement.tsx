import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Edit, Check, X, Eye, MapPin, DollarSign } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import collections from '../../utils/firebaseCollections';
import { FirestoreProperty } from '../../types';

const statusMap: { [key: number]: string } = {
  0: 'libre',
  1: 'occupe',
  2: 'reserve'
};

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<FirestoreProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [validationFilter, setValidationFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<FirestoreProperty | null>(null);

  // Fetch properties from Firestore
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesCollection = collection(db, collections.PROPRIETES);
        const propertiesSnapshot = await getDocs(propertiesCollection);
        const propertiesList: FirestoreProperty[] = propertiesSnapshot.docs.map(doc => ({
          ...(doc.data() as FirestoreProperty),
          id: doc.id
        }));
        setProperties(propertiesList);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ville.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || property.nomType === typeFilter;
      const matchesStatus = statusFilter === 'all' || statusMap[property.statut] === statusFilter;
      const matchesValidation = validationFilter === 'all' || property.validationStatus === validationFilter;

      return matchesSearch && matchesType && matchesStatus && matchesValidation;
    });
  }, [properties, searchTerm, typeFilter, statusFilter, validationFilter]);

  const handlePropertyAction = (propertyId: string, action: string) => {
    console.log(`Action ${action} sur propriété ${propertyId}`);
    // Implement actual Firebase updates here
  };

  const PropertyCard: React.FC<{ property: FirestoreProperty }> = ({ property }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={property.images[0] || 'https://via.placeholder.com/400x200'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.nomType.toLowerCase().includes('appartement')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {property.nomType}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusMap[property.statut] === 'libre'
                ? 'bg-green-100 text-green-800'
                : statusMap[property.statut] === 'occupe'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {statusMap[property.statut]}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.validationStatus === 'accepte'
                ? 'bg-green-100 text-green-800'
                : property.validationStatus === 'rejete'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {property.validationStatus === 'accepte'
              ? 'Validé'
              : property.validationStatus === 'rejete'
              ? 'Rejeté'
              : 'En attente'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{property.title}</h3>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {`${property.adresse}, ${property.quartier}, ${property.ville}`}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-orange-600 font-bold text-xl">
              <DollarSign className="w-5 h-5 mr-1" />
              {property.prix.toLocaleString()} {property.devise}/{property.frequence}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{property.surface}m²</div>
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
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePropertyAction(property.id, 'edit')}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            {property.validationStatus === 'en_attente' && (
              <>
                <button
                  onClick={() => handlePropertyAction(property.id, 'approve')}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="Valider"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePropertyAction(property.id, 'reject')}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Rejeter"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Propriétés</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredProperties.length} propriété(s) trouvée(s)
          </p>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter propriété</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre, adresse, quartier ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="Appartement moderne">Appartement moderne</option>
            {/* Add more nomType options dynamically if needed */}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="libre">Libre</option>
            <option value="occupe">Occupé</option>
            <option value="reserve">Réservé</option>
          </select>

          <select
            value={validationFilter}
            onChange={(e) => setValidationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Toutes validations</option>
            <option value="accepte">Validé</option>
            <option value="en_attente">En attente</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProperty.title}</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProperty.images[0] || 'https://via.placeholder.com/400x200'}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {selectedProperty.images.length > 1 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {selectedProperty.images.slice(1, 4).map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${selectedProperty.title} ${index + 2}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Informations générales
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.nomType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                        <span className="text-gray-900 dark:text-white">{statusMap[selectedProperty.statut]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Prix:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {selectedProperty.prix.toLocaleString()} {selectedProperty.devise}/{selectedProperty.frequence}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Surface:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.surface}m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Adresse:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.adresse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Quartier:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.quartier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Ville:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.ville}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Région:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pays:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.pays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pièces:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.nombrePieces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Salles de bain:</span>
                        <span className="text-gray-900 dark:text-white">{selectedProperty.nombreSalleBains}</span>
                      </div>
                      {selectedProperty.certificate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Certificat:</span>
                          <a
                            href={selectedProperty.certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Voir le certificat
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handlePropertyAction(selectedProperty.id, 'edit')}
                        className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      >
                        Modifier la propriété
                      </button>
                      {selectedProperty.position && (
                        <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          Voir sur la carte
                        </button>
                      )}
                      {selectedProperty.validationStatus === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handlePropertyAction(selectedProperty.id, 'approve')}
                            className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          >
                            Valider la propriété
                          </button>
                          <button
                            onClick={() => handlePropertyAction(selectedProperty.id, 'reject')}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            Rejeter la propriété
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {selectedProperty.description}
                </p>
              </div>

              {selectedProperty.localImages && selectedProperty.localImages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Images locales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProperty.localImages.map((img, index) => (
                      <div key={index} className="text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Nom: {img.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">Taille: {img.size}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Visualisable: {img.viewable ? 'Oui' : 'Non'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;