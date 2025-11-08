import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./components/Dashboard/Dashboard";
import UserManagement from "./components/Users/UserManagement";
import UserEditForm from "./components/Users/UpdateUser";
import PropertyManagement from "./components/Properties/PropertyManagement";
import TransactionManagement from "./components/Transactions/TransactionManagement";
import ContractManagement from "./components/Contracts/ContractManagement";
import MessagingSystem from "./components/Messaging/MessagingSystem";
import PartnerManagement from "./components/Partners/PartnerManagement";
import Settings from "./components/Settings/Settings";
import { useAppSelector } from "./store/hooks";
import LoginPage from "./pages/login/page";
import PropertyEditForm from "./pages/properties/upadate-properties";
import NotificationCard from "./pages/email-template";
import PropertyAddForm from "./pages/properties/add-propertie";
import CommercialPropertiesForm from "./pages/properties/commercials/commercial-properties-form";
import ResidentialsPropertiesList from "./pages/properties/residential/page";
import CommercialPropertiesList from "./pages/properties/commercials/page";

function App() {
  const { user, error, loading } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user; // Vérifie si l'utilisateur est connecté
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (loading || error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          {/* Animated spinner */}
          <svg
            className="animate-spin h-12 w-12 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          {/* Logo or icon */}
          <img src="/logo.svg" alt="Kinaru" className="h-8 w-auto mb-1" />
          {/* Loading text */}
          <div className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
            Chargement de Kinaru...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated ? (
        // Layout pour les routes authentifiées
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              language={language}
              onToggleLanguage={() =>
                setLanguage(language === "fr" ? "en" : "fr")
              }
            />

            <main className="flex-1 overflow-y-auto p-4">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/email" element={<NotificationCard />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/users/:id" element={<UserEditForm />} />
                {/*  */}
                <Route path="/properties" element={<PropertyManagement />} />
                <Route path="/properties/add" element={<PropertyAddForm />} />
                <Route
                  path="/properties/:id/edit"
                  element={<PropertyEditForm />}
                />
                {/* commercial properties pages */}
                <Route
                  path="/residential-properties"
                  element={<ResidentialsPropertiesList />}
                />

                <Route
                  path="/residential-add"
                  element={<CommercialPropertiesForm />}
                />

                {/*  */}

                       {/* commercial properties pages */}
                <Route
                  path="/commercial-properties"
                  element={<CommercialPropertiesList />}
                />

                <Route
                  path="/commercial-add"
                  element={<CommercialPropertiesForm />}
                />

                {/*  */}
                <Route
                  path="/transactions"
                  element={<TransactionManagement />}
                />
                <Route path="/contracts" element={<ContractManagement />} />
                <Route path="/messaging" element={<MessagingSystem />} />
                <Route path="/partners" element={<PartnerManagement />} />
                <Route path="/settings" element={<Settings />} />
                {/* Fallback pour les routes protégées */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Routes non authentifiées (layout simple, sans Sidebar/Header)
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            {/* Fallback pour les routes publiques */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
