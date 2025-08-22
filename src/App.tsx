import React, { useEffect, useState } from "react";
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

function App() {
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

  return (
    <Router>
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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/users/:id" element={<UserEditForm />} />
              <Route path="/properties" element={<PropertyManagement />} />
              <Route path="/transactions" element={<TransactionManagement />} />
              <Route path="/contracts" element={<ContractManagement />} />
              <Route path="/messaging" element={<MessagingSystem />} />
              <Route path="/partners" element={<PartnerManagement />} />
              <Route path="/settings" element={<Settings />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
