import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit, Ban, Check, X, Eye, UserX } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import { User } from '../../types';

export default function UserManagement() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'registrationDate') {
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      }
      if (sortBy === 'lastActivity') {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} sur utilisateur ${userId}`);
    // Simulation d'action
  };

  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                user.role === 'proprietaire' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                user.role === 'agent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
              }`}>
                {user.role}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'actif' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                user.status === 'banni' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
                {user.status}
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
          <button
            onClick={() => handleUserAction(user.id, 'edit')}
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          {user.status === 'en_attente' && (
            <>
              <button
                onClick={() => handleUserAction(user.id, 'approve')}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Valider"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUserAction(user.id, 'reject')}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Rejeter"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {user.status !== 'banni' && (
            <button
              onClick={() => handleUserAction(user.id, 'ban')}
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
          <span className="text-gray-500 dark:text-gray-400">Localisation:</span>
          <p className="font-medium text-gray-900 dark:text-white">{user.location}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Inscription:</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(user.registrationDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {user.documents && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            Documents en attente de validation
          </p>
          <div className="flex space-x-2 mt-2">
            {user.documents.map((doc, index) => (
              <span key={index} className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
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

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
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
            <option value="registrationDate">Date d'inscription</option>
            <option value="lastActivity">Dernière activité</option>
            <option value="name">Nom</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Modal de profil utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profil de {selectedUser.name}
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.status === 'actif' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      selectedUser.status === 'banni' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Localisation:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedUser.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Inscription:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(selectedUser.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Dernière activité:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(selectedUser.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}