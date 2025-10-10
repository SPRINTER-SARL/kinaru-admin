import React from "react";

// --- Default Data for Visualization ---
const defaultContract = {
  contractNumber: "CT-2024-0042",
  startDate: "15/05/2024",
  endDate: "15/05/2025",
};

const defaultTenant = {
  name: "Marc Dupont",
  email: "marc.dupont@example.com",
  phone: "+33 6 12 34 56 78",
};

const defaultOwner = {
  name: "ImmoPlus SARL",
  email: "contact@immoplus.com",
  phone: "+33 1 98 76 54 32",
};

/**
 * Composant de visualisation pour une notification immobilière.
 * Utilise les props pour les données dynamiques avec des valeurs par défaut.
 */
const NotificationCard = ({
  propertyTitle = "Magnifique T3 - Vue Mer",
  propertyType = "Appartement",
  propertyAddress = "12 Rue des Plages, 06000 Nice",
  price = 1500,
  currency = "€",
  frequency = "mois",
  contractDetails = defaultContract,
  tenant = defaultTenant,
  owner = defaultOwner,
}) => {
  // Formatage du prix pour l'affichage (ex: 1 500 €)
  const formattedPrice = price.toLocaleString("fr-FR");
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-2xl mx-auto my-10 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="text-center p-8 border-b-4 border-orange-500 bg-white">
          <img
            src="https://placehold.co/100x40/f97316/ffffff?text=KINARU"
            alt="Kinaru Logo"
            className="h-10 mx-auto mb-4"
            // onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/f97316/ffffff?text=KINARU" }}
          />
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
            Notification Immobilière
          </h1>
        </header>

        {/* Contenu Principal */}
        <main className="p-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Une nouvelle activité a été enregistrée concernant la propriété
            suivante :
          </p>

          {/* Carte de la propriété */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-orange-600 mb-4">
              {propertyTitle}
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="text-gray-500 w-32 font-medium">Type :</span>
                <span className="text-gray-800 font-semibold">
                  {propertyType}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32 font-medium">
                  Adresse :
                </span>
                <span className="text-gray-800">{propertyAddress}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32 font-medium">Prix :</span>
                <span className="text-gray-900 font-extrabold text-lg">
                  {formattedPrice} {currency}/{frequency}
                </span>
              </div>
            </div>
          </div>

          {/* Détails du contrat (Conditionnel) */}
          {contractDetails && (
            <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-amber-700 mb-4">
                Détails du contrat
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="text-amber-800 w-32 font-medium">
                    N° Contrat :
                  </span>
                  <span className="text-gray-900 font-medium">
                    {contractDetails.contractNumber}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-amber-800 w-32 font-medium">
                    Période :
                  </span>
                  <span className="text-gray-900">
                    Du {contractDetails.startDate} au {contractDetails.endDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Informations des parties (Conditionnel) */}
          {(tenant || owner) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Locataire */}
              {tenant && (
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-5">
                  <h4 className="text-base font-semibold text-cyan-700 mb-3">
                    Locataire
                  </h4>
                  <div className="text-sm text-blue-900 space-y-1">
                    <p className="font-medium">{tenant.name}</p>
                    <p>{tenant.email}</p>
                    {tenant.phone && <p>{tenant.phone}</p>}
                  </div>
                </div>
              )}
              {/* Propriétaire */}
              {owner && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-5">
                  <h4 className="text-base font-semibold text-green-700 mb-3">
                    Propriétaire
                  </h4>
                  <div className="text-sm text-green-900 space-y-1">
                    <p className="font-medium">{owner.name}</p>
                    <p>{owner.email}</p>
                    {owner.phone && <p>{owner.phone}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center p-8 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-600 mb-4">
            Pour plus d'informations, connectez-vous à votre espace Kinaru
          </p>
          <a
            href="https://admin.kinaru.com"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Accéder à mon espace
          </a>
          <p className="text-xs text-gray-400 mt-6">
            © {currentYear} Kinaru. Tous droits réservés.
            <br />
            Pour toute assistance, contactez{" "}
            <a
              href="mailto:support@kinaru.com"
              className="text-orange-600 hover:text-orange-700 transition duration-200"
            >
              support@kinaru.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default NotificationCard;
