// components/properties/PropertyManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, X } from "lucide-react";
import { FirestoreProperty } from "../../types"; // Adjust path as needed
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import PropertyCard from "./PropertyCard"; // Extracted component
import {
  deleteProperty,
  listenToProperties,
  updatePropertyValidation,
} from "./propertiesThunks";
import { clearError } from "./propertiesSlice";

const statusMap: { [key: number]: string } = {
  0: "libre",
  1: "occupe",
  2: "reserve",
};

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    list: properties,
    loading,
    error,
  } = useAppSelector((state) => state.properties);
  const { user } = useAppSelector((state) => state.auth);
  const { list: users } = useAppSelector((state) => state.users);
  const to = user?.email || ""; // Ensure user is defined and has an email

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [validationFilter, setValidationFilter] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] =
    useState<FirestoreProperty | null>(null);

  // Clear error on mount or when needed
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ville.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" || property.nomType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || statusMap[property.statut] === statusFilter;
      const matchesValidation =
        validationFilter === "all" ||
        property.validationStatus === validationFilter;

      return matchesSearch && matchesType && matchesStatus && matchesValidation;
    });
  }, [properties, searchTerm, typeFilter, statusFilter, validationFilter]);

  const handlePropertyAction = async (propertyId: string, action: string) => {
    console.log(`Action ${action} sur propriété ${propertyId}`);
    const property = properties.find((p) => p.id === propertyId);
    if (!property) {
      console.error("Propriété non trouvée");
      return;
    }

    // Prepare email data using service
    const emailData = await preparePropertyEmailData(
      property,
      users,
      to,
      action
    );

    switch (action) {
      case "approve":
        await dispatch(
          updatePropertyValidation({
            propertyId,
            emailData,
            status: "accepte",
          })
        );
        break;
      case "reject":
        await dispatch(
          updatePropertyValidation({
            propertyId,
            emailData,
            status: "rejete",
          })
        );
        break;
      case "edit":
        navigate(`/properties/${propertyId}/edit`);
        break;
      case "cancel": // Assuming "annulation" maps to a cancel action; adjust if needed
        await dispatch(
          updatePropertyValidation({
            propertyId,
            emailData,
            status: "annule", // Adjust status for cancel
          })
        );
        break;
      case "delete":
        await dispatch(deleteProperty(propertyId));
        break;
      default:
        // Other actions like view are handled via setSelectedProperty
        break;
    }
  };

  // Service function to prepare email data (business logic separated)
  const preparePropertyEmailData = async (
    property: FirestoreProperty,
    users: any[], // Adjust type as needed
    to: string,
    action: string
  ) => {
    const currency = property.devise;
    const frequency = property.frequence;
    const propertyTitle = property.title;
    const propertyType = property.nomType;
    const ownerId = property.userId || "N/A"; // Adjust based on your data structure
    const owner = users.find((u) => u.id === ownerId) || null;
    const price = property.prix;
    const propertyAddress = `${property.adresse}, ${property.quartier}, ${property.ville}`;

    // tenant and contractDetails can be added if available
    // const tenant = property.tenant || null;
    // const contractDetails = property.contractDetails || null;

    return {
      to,
      currency,
      frequency,
      propertyTitle,
      propertyType,
      owner, // Pass owner for email service
      // tenant,
      // contractDetails,
      price,
      propertyAddress,
      actionType: action as "approve" | "reject" | "cancel", // Type for email customization
    };
  };

  if (loading && properties.length === 0) {
    return <div className="p-6 text-center">Chargement des propriétés...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Propriétés
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredProperties.length} propriété(s) trouvée(s)
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/properties/add");
          }}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          disabled={loading}
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
              disabled={loading}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            disabled={loading}
          >
            <option value="all">Tous les types</option>
            <option value="Appartement moderne">Appartement moderne</option>
            {/* Add more nomType options dynamically if needed */}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            disabled={loading}
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
            disabled={loading}
          >
            <option value="all">Toutes validations</option>
            <option value="accepte">Validé</option>
            <option value="en_attente">En attente</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onAction={(action) => handlePropertyAction(property.id, action)}
            loading={loading}
            setSelectedProperty={setSelectedProperty}
          />
        ))}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedProperty.title}
                </h2>
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
                    src={
                      selectedProperty.images[0] ||
                      "https://via.placeholder.com/400x200"
                    }
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
                        <span className="text-gray-500 dark:text-gray-400">
                          Type:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.nomType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Statut:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {statusMap[selectedProperty.statut]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Prix:
                        </span>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {selectedProperty.prix.toLocaleString()}{" "}
                          {selectedProperty.devise}/{selectedProperty.frequence}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Surface:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.surface}m²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Adresse:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.adresse}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Quartier:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.quartier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Ville:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.ville}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Région:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.region}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Pays:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.pays}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Pièces:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.nombrePieces}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Salles de bain:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProperty.nombreSalleBains}
                        </span>
                      </div>
                      {selectedProperty.certificate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Certificat:
                          </span>
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
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          handlePropertyAction(selectedProperty.id, "edit")
                        }
                        className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        Modifier la propriété
                      </button>
                      {selectedProperty.position && (
                        <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          Voir sur la carte
                        </button>
                      )}
                      {selectedProperty.validationStatus === "en_attente" && (
                        <>
                          <button
                            onClick={() =>
                              handlePropertyAction(
                                selectedProperty.id,
                                "approve"
                              )
                            }
                            className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            Valider la propriété
                          </button>
                          <button
                            onClick={() =>
                              handlePropertyAction(
                                selectedProperty.id,
                                "reject"
                              )
                            }
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            Rejeter la propriété
                          </button>
                        </>
                      )}
                      {/* Add cancel action if needed */}
                      {selectedProperty.validationStatus === "accepte" && (
                        <button
                          onClick={() =>
                            handlePropertyAction(selectedProperty.id, "cancel")
                          }
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          Annuler la propriété
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {selectedProperty.description}
                </p>
              </div>

              {selectedProperty.localImages &&
                selectedProperty.localImages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Images locales
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProperty.localImages.map((img, index) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400">
                            Nom: {img.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Taille: {img.size}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Visualisable: {img.viewable ? "Oui" : "Non"}
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
