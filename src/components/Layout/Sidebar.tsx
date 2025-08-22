import React from "react";
import { 
  Users, 
  Building, 
  Map, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Handshake, 
  History,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/users", label: "Utilisateurs", icon: Users },
  { path: "/properties", label: "Propriétés", icon: Building },
  { path: "/map", label: "Carte", icon: Map },
  { path: "/transactions", label: "Transactions", icon: CreditCard },
  { path: "/contracts", label: "Contrats", icon: FileText },
  { path: "/messaging", label: "Messagerie", icon: MessageSquare },
  { path: "/statistics", label: "Statistiques", icon: BarChart3 },
  { path: "/partners", label: "Partenaires", icon: Handshake },
  { path: "/logs", label: "Journal", icon: History },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Building className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl font-bold">Kinaru Admin</h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-lg"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
