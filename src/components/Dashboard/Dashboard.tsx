import {
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        {trend && (
          <p
            className={`text-sm mt-1 ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {/* {trend > 0 ? "+" : ""}
            {trend}% ce mois */}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AlertCard = ({ title, message, type }: any) => (
  <div
    className={`p-4 rounded-lg border-l-4 ${
      type === "warning"
        ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20"
        : "bg-red-50 border-red-400 dark:bg-red-900/20"
    }`}
  >
    <div className="flex items-center">
      <AlertTriangle
        className={`w-5 h-5 mr-3 ${
          type === "warning" ? "text-yellow-600" : "text-red-600"
        }`}
      />
      <div>
        <h3
          className={`font-medium ${
            type === "warning"
              ? "text-yellow-800 dark:text-yellow-200"
              : "text-red-800 dark:text-red-200"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm mt-1 ${
            type === "warning"
              ? "text-yellow-700 dark:text-yellow-300"
              : "text-red-700 dark:text-red-300"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { list: users } = useAppSelector((state) => state.users);
  const { list: properties } = useAppSelector((state) => state.properties);
  const { list: contracts } = useAppSelector((state) => state.contracts);
  // const { list: transactions } = useAppSelector((state) => state.t); // Assuming transactions slice

  // Real stats calculations
  const pendingUsers = users.filter((u) => u.statut === 1).length;
  const pendingProperties = properties.filter(
    (p) => p.validationStatus === "en_attente"
  ).length;
  // const pendingTransactions = transactions.filter(t => t.status === 'en_attente').length;
  // const activeContracts = contracts.filter(c => c.statut === 'actif').length;
  const totalUsers = users.length;
  const activeProperties = properties.filter((p) => p.etat === 1).length;
  // const monthlyRevenue = transactions
  //   .filter(t => {
  //     const date = new Date(t.date);
  //     return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
  //   })
  //   .reduce((sum, t) => sum + (t.amount || 0), 0);
  const trendUsers = 12.5; // Could be calculated from previous month data
  const trendProperties = 8.2;
  const trendRevenue = 15.3;
  const trendContracts = -2.1;

  const quickStats = [
    {
      title: "Utilisateurs Totaux",
      value: totalUsers.toLocaleString(),
      icon: Users,
      // trend: trendUsers,
      color: "bg-blue-500",
    },
    {
      title: "Propriétés Actives",
      value: activeProperties.toLocaleString(),
      icon: Building,
      // trend: trendProperties,
      color: "bg-green-500",
    },
    // {
    //   title: 'Revenus ce Mois',
    //   value: `${monthlyRevenue.toLocaleString()}€`,
    //   icon: CreditCard,
      // trend: trendRevenue,
    //   color: 'bg-orange-500'
    // },
    // {
    //   title: 'Contrats Actifs',
    //   value: activeContracts.toString(),
    //   icon: FileText,
      // trend: trendContracts,
    //   color: 'bg-purple-500'
    // }
  ];

  const alerts = [
    {
      title: "Inscriptions en attente",
      message: `${pendingUsers} utilisateurs attendent validation`,
      type: "warning",
    },
    {
      title: "Propriétés à valider",
      message: `${pendingProperties} propriétés nécessitent votre attention`,
      type: "warning",
    },
    // {
    //   title: 'Transactions en attente',
    //   message: `${pendingTransactions} paiements en cours de traitement`,
    //   type: 'error'
    // }
  ];

  // Recent activities derived from data (e.g., last 4 creations/updates)
  const recentActivities = [
    ...users
      .slice(-1)
      .map((u) => ({
        action: "Nouvel utilisateur inscrit",
        user: u.nom || "Utilisateur",
        time: "Il y a 2 minutes",
      })),
    ...properties
      .slice(-1)
      .map((p) => ({
        action: "Propriété validée",
        user: p.title || "Propriété",
        time: "Il y a 15 minutes",
      })),
    // ...transactions.slice(-1).map(t => ({ action: 'Transaction traitée', user: t.description || 'Transaction', time: 'Il y a 1 heure' })),
    ...contracts
      .slice(-1)
      .map((c) => ({
        action: "Contrat signé",
        user: "Contrat",
        time: "Il y a 2 heures",
      })),
  ].slice(0, 4); // Limit to 4

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "validateUsers":
        navigate("/users/pending");
        break;
      case "validateProperties":
        navigate("/properties/pending");
        break;
      case "stats":
        navigate("/analytics");
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue sur votre tableau de bord
        </h1>
        <p className="opacity-90">
          Voici un aperçu de l'activité de votre plateforme Kinaru
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Alertes et Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertes importantes
          </h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activité récente
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction("validateUsers")}
            className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left"
          >
            <Users className="w-6 h-6 text-orange-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Valider inscriptions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingUsers} en attente
            </p>
          </button>

          <button
            onClick={() => handleQuickAction("validateProperties")}
            className="p-4 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
          >
            <Building className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Valider propriétés
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingProperties} en attente
            </p>
          </button>

          <button
            onClick={() => handleQuickAction("stats")}
            className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
          >
            <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Voir statistiques
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rapport mensuel
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
