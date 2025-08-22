import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Archive,
  Bell,
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import collections from "../../utils/firebaseCollections";
import {
  FirestoreContract,
  FirestoreProperty,
  FirestoreUser,
} from "../../types";

const statusMap: { [key: number]: string } = {
  0: "expire",
  1: "actif",
  2: "resilie",
};

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<FirestoreContract[]>([]);
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [properties, setProperties] = useState<FirestoreProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] =
    useState<FirestoreContract | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  // Fetch contracts, users, and properties from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contracts
        const contractsCollection = collection(db, collections.CONTRATS);
        const contractsSnapshot = await getDocs(contractsCollection);
        const contractsList: FirestoreContract[] = contractsSnapshot.docs.map(
          (doc) => ({
            ...(doc.data() as FirestoreContract),
            id: doc.id,
          })
        );
        setContracts(contractsList);

        // Fetch users
        const usersCollection = collection(db, collections.USERS);
        const usersSnapshot = await getDocs(usersCollection);
        const usersList: FirestoreUser[] = usersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          nom: doc.data().nom,
          prenom: doc.data().prenom,
        }));
        setUsers(usersList);

        // Fetch properties
        const propertiesCollection = collection(db, collections.PROPRIETES);
        const propertiesSnapshot = await getDocs(propertiesCollection);
        const propertiesList: FirestoreProperty[] = propertiesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            userId: doc.data().userId || "",
            title: doc.data().title || "",
            description: doc.data().description || "",
            type: doc.data().type || "",
            statut: doc.data().statut || 0,
            etat: doc.data().etat || 0,
            validationStatus: doc.data().validationStatus || "en_attente",
            prix: doc.data().prix || 0,
            devise: doc.data().devise || "XAF",
            frequence: doc.data().frequence || "Mois",
            adresse: doc.data().adresse || "",
            arrondissement: doc.data().arrondissement || "",
            quartier: doc.data().quartier || "",
            ville: doc.data().ville || "",
            region: doc.data().region || "",
            pays: doc.data().pays || "",
            nomType: doc.data().nomType || "",
            nombrePieces: doc.data().nombrePieces || "",
            nombreSalleBains: doc.data().nombreSalleBains || "",
            surface: doc.data().surface || "",
            favorite: doc.data().favorite || 0,
            certificate: doc.data().certificate || "",
            images: doc.data().images || [],
            localImages: doc.data().localImages || [],
            position: doc.data().position || { lat: 0, lng: 0 },
            created_at: doc.data().created_at || "",
            updated_at: doc.data().updated_at || "",
            usage: doc.data().usage || "",
          })
        );
        setProperties(propertiesList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts
      .filter((contract) => {
        const tenant = users.find((u) => u.uid === contract.locataireId);
        const owner = users.find((u) => u.uid === contract.proprietaireId);
        const property = properties.find((p) => p.id === contract.proprieteId);

        const matchesSearch =
          (tenant ? `${tenant.nom} ${tenant.prenom}` : "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (owner ? `${owner.nom} ${owner.prenom}` : "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (property ? property.title : "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || statusMap[contract.statut] === statusFilter;
        const matchesArchived = showArchived
          ? statusMap[contract.statut] === "expire"
          : statusMap[contract.statut] !== "expire";

        return matchesSearch && matchesStatus && matchesArchived;
      })
      .sort(
        (a, b) =>
          new Date(b.dateDebutContrat).getTime() -
          new Date(a.dateDebutContrat).getTime()
      );
  }, [contracts, users, properties, searchTerm, statusFilter, showArchived]);

  const getExpiringContracts = () => {
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    return contracts.filter((contract) => {
      const endDate = new Date(contract.dateFinContrat);
      return (
        statusMap[contract.statut] === "actif" &&
        endDate <= fiveDaysFromNow &&
        endDate >= now
      );
    });
  };

  const handleContractAction = (contractId: string, action: string) => {
    console.log(`Action ${action} sur contrat ${contractId}`);
    if (action === "sign") {
      setSelectedContract(contracts.find((c) => c.id === contractId) || null);
      setShowSignatureModal(true);
    }
    // Implement other Firebase updates here
  };

  const ContractCard: React.FC<{ contract: FirestoreContract }> = ({
    contract,
  }) => {
    const tenant = users.find((u) => u.uid === contract.locataireId);
    const owner = users.find((u) => u.uid === contract.proprietaireId);
    const property = properties.find((p) => p.id === contract.proprieteId);

    const isExpiringSoon = () => {
      const endDate = new Date(contract.dateFinContrat);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
      );
      return (
        statusMap[contract.statut] === "actif" &&
        daysUntilExpiry <= 5 &&
        daysUntilExpiry >= 0
      );
    };

    return (
      <div
        className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border transition-all ${
          isExpiringSoon()
            ? "border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10"
            : "border-gray-100 dark:border-slate-700 hover:shadow-md"
        }`}
      >
        {isExpiringSoon() && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Bell className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Expire dans{" "}
              {Math.ceil(
                (new Date(contract.dateFinContrat).getTime() -
                  new Date().getTime()) /
                  (1000 * 3600 * 24)
              )}{" "}
              jour(s)
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Contrat #{contract.id}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusMap[contract.statut] === "actif"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : statusMap[contract.statut] === "expire"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {statusMap[contract.statut]}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contract.signatureStatus === "signe"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                }`}
              >
                {contract.signatureStatus === "signe"
                  ? "Signé"
                  : "En attente signature"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Locataire:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {tenant ? `${tenant.nom} ${tenant.prenom}` : "Inconnu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Propriétaire:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {owner ? `${owner.nom} ${owner.prenom}` : "Inconnu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Propriété:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {property?.title || "Inconnue"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Période:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(contract.dateDebutContrat).toLocaleDateString()} -{" "}
                    {new Date(contract.dateFinContrat).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Montant prévu:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {contract.montantPrevu.toLocaleString()} {contract.devise}/
                    {contract.frequence}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Montant versé:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {contract.montantVerse.toLocaleString()} {contract.devise}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setSelectedContract(contract)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleContractAction(contract.id, "edit")}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            {contract.signatureStatus === "en_attente" && (
              <button
                onClick={() => handleContractAction(contract.id, "sign")}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Signer"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {statusMap[contract.statut] === "expire" && (
              <button
                onClick={() => handleContractAction(contract.id, "archive")}
                className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                title="Archiver"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const expiringContracts = getExpiringContracts();

  return (
    <div className="p-6 space-y-6">
      {expiringContracts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Contrats expirant bientôt
            </h3>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {expiringContracts.length} contrat(s) expire(nt) dans les 5
            prochains jours
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Contrats
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredContracts.length} contrat(s) trouvé(s)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showArchived
                ? "bg-gray-500 text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            {showArchived ? "Masquer archivés" : "Voir archivés"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau contrat</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par locataire, propriétaire ou propriété..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="expire">Expiré</option>
            <option value="resilie">Résilié</option>
          </select>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Filtres:
            </span>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Inclure archivés
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>

      {selectedContract && !showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contrat #{selectedContract.id}
                </h2>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Informations du contrat
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Statut
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {statusMap[selectedContract.statut]}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Signature
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.signatureStatus === "signe"
                          ? "Signé"
                          : "En attente"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de début
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(
                          selectedContract.dateDebutContrat
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de fin
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(
                          selectedContract.dateFinContrat
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Durée du contrat
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.durreeDuContrat} an(s)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Montant prévu
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {selectedContract.montantPrevu.toLocaleString()}{" "}
                        {selectedContract.devise}/{selectedContract.frequence}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Montant versé
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {selectedContract.montantVerse.toLocaleString()}{" "}
                        {selectedContract.devise}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Montant caution
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.montantCaution.toLocaleString()}{" "}
                        {selectedContract.devise}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Moyen de paiement
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.moyentPayment.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Détails supplémentaires
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Locataire
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {users.find(
                          (u) => u.uid === selectedContract.locataireId
                        )
                          ? `${
                              users.find(
                                (u) => u.uid === selectedContract.locataireId
                              )!.nom
                            } ${
                              users.find(
                                (u) => u.uid === selectedContract.locataireId
                              )!.prenom
                            }`
                          : "Inconnu"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Propriétaire
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {users.find(
                          (u) => u.uid === selectedContract.proprietaireId
                        )
                          ? `${
                              users.find(
                                (u) => u.uid === selectedContract.proprietaireId
                              )!.nom
                            } ${
                              users.find(
                                (u) => u.uid === selectedContract.proprietaireId
                              )!.prenom
                            }`
                          : "Inconnu"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Propriété
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {properties.find(
                          (p) => p.id === selectedContract.proprieteId
                        )?.title || "Inconnue"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date d'échéance paiement
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.paiementDueDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Délai restitution caution
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.delaiRestitutionCaution}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Durée préavis
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedContract.durrePreAvis}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Créé le
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(
                          selectedContract.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mis à jour le
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(
                          selectedContract.updated_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() =>
                    handleContractAction(selectedContract.id, "edit")
                  }
                  className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </button>
                {selectedContract.signatureStatus === "en_attente" && (
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Signer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Signature numérique
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Vous êtes sur le point de signer le contrat #
                {selectedContract.id}
              </p>

              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Zone de signature numérique
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  (Simulation de signature)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log("Contrat signé:", selectedContract.id);
                    setShowSignatureModal(false);
                    setSelectedContract(null);
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Confirmer signature
                </button>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
