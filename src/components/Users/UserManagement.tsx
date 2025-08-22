import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, Edit, Ban, Check, X, Eye } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import collections from "../../utils/firebaseCollections";
import { User } from "../../types";
import { Link } from "react-router-dom";

const statusMap: { [key: number]: string } = {
  0: "en_attente",
  1: "actif",
  2: "banni",
};

const roleMap: { [key: number]: string } = {
  1: "client",
  2: "proprietaire",
  3: "agent",
  4: "agence",
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastUpdated");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, collections.USERS);
        const usersSnapshot = await getDocs(usersCollection);
        const usersList: User[] = usersSnapshot.docs.map((doc) => ({
          ...(doc.data() as User),
          uid: doc.id,
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          `${user.nom} ${user.prenom}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telephone.includes(searchTerm);
        const matchesRole =
          roleFilter === "all" || roleMap[user.typeUsersId] === roleFilter;
        const matchesStatus =
          statusFilter === "all" || statusMap[user.statut] === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "lastUpdated") {
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        }
        if (sortBy === "name") {
          return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
        }
        return 0;
      });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} sur utilisateur ${userId}`);

    let link = "";

    switch (action) {
      case "edit":
        link = `/users/${userId}/edit`;
        break;
      case "view":
        link = `/users/${userId}`;
        break;
      case "delete":
        link = `/users/${userId}/delete`;
        break;
      default:
        link = `/users/${userId}`;
        break;
    }

    // Exemple : rediriger automatiquement
    window.location.href = link;

    // Ou retourner le lien si tu veux juste l'utiliser ailleurs
    return link;
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {user.photoProfil ? (
            <img
              src={user.photoProfil}
              alt={`${user.nom} ${user.prenom}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.nom[0]}
              {user.prenom[0]}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.nom} {user.prenom}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  roleMap[user.typeUsersId] === "client"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : roleMap[user.typeUsersId] === "proprietaire"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : roleMap[user.typeUsersId] === "agent"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                }`}
              >
                {roleMap[user.typeUsersId]}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusMap[user.statut] === "actif"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : statusMap[user.statut] === "banni"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                }`}
              >
                {statusMap[user.statut]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedUser(user)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Voir profil"
          >
            <Eye className="w-4 h-4" />
          </button>
          <Link
            to={`/users/${user.uid}`}
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Link>
          {statusMap[user.statut] === "en_attente" && (
            <>
              <button
                onClick={() => handleUserAction(user.uid, "approve")}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Valider"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUserAction(user.uid, "reject")}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Rejeter"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {statusMap[user.statut] !== "banni" && (
            <button
              onClick={() => handleUserAction(user.uid, "ban")}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Bannir"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Adresse:</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.addresse}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Téléphone:</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.telephone}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Dernière mise à jour:
          </span>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(user.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>

      {(user.cniNumber || user.cniRecto || user.cniVerso) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            Documents d'identité
          </p>
          <div className="flex space-x-2 mt-2">
            {user.cniNumber && (
              <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                CNI: {user.cniNumber}
              </span>
            )}
            {user.cniRecto && (
              <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                CNI Recto
              </span>
            )}
            {user.cniVerso && (
              <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1-rounded">
                CNI Verso
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter utilisateur</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">Client</option>
            <option value="proprietaire">Propriétaire</option>
            <option value="agent">Agent</option>
            <option value="agence">Agence</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="en_attente">En attente</option>
            <option value="banni">Banni</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="lastUpdated">Dernière mise à jour</option>
            <option value="name">Nom</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map((user) => (
          <UserCard key={user.uid} user={user} />
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profil de {selectedUser.nom} {selectedUser.prenom}
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                {selectedUser.photoProfil ? (
                  <img
                    src={selectedUser.photoProfil}
                    alt={`${selectedUser.nom} ${selectedUser.prenom}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {selectedUser.nom[0]}
                    {selectedUser.prenom[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser.nom} {selectedUser.prenom}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedUser.telephone}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        roleMap[selectedUser.typeUsersId] === "client"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          : roleMap[selectedUser.typeUsersId] === "proprietaire"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : roleMap[selectedUser.typeUsersId] === "agent"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                      }`}
                    >
                      {roleMap[selectedUser.typeUsersId]}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusMap[selectedUser.statut] === "actif"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : statusMap[selectedUser.statut] === "banni"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      }`}
                    >
                      {statusMap[selectedUser.statut]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Informations
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Adresse:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.addresse}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Téléphone:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.telephone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Dernière mise à jour:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(
                          selectedUser.lastUpdated
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedUser.cniNumber && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Numéro CNI:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedUser.cniNumber}
                        </span>
                      </div>
                    )}
                    {selectedUser.CNIDateDelivrer && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          CNI Délivré:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(
                            selectedUser.CNIDateDelivrer
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedUser.cniExpirationDate && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          CNI Expiration:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(
                            selectedUser.cniExpirationDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedUser.fcmToken && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          FCM Token:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white truncate">
                          {selectedUser.fcmToken.substring(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                      Modifier les informations
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      Voir l'historique
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      Suspendre le compte
                    </button>
                  </div>
                </div>
              </div>

              {selectedUser.notificationPrefs && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Préférences de notification
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Messages:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.notificationPrefs.messages
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Nouvelles propriétés:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.notificationPrefs.newProperties
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Paiements:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.notificationPrefs.payments
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Réservations:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.notificationPrefs.reservations
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Visites:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUser.notificationPrefs.visits
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
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

export default UserManagement;
