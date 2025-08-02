export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'proprietaire' | 'agent' | 'agence';
  adminRole?: 'super_admin' | 'admin' | 'superviseur' | 'senseur';
  status: 'actif' | 'banni' | 'en_attente';
  location: string;
  registrationDate: string;
  lastActivity: string;
  avatar?: string;
  documents?: string[];
}

export interface Property {
  id: string;
  name: string;
  description: string;
  type: 'residentiel' | 'commercial';
  status: 'libre' | 'occupe' | 'reserve';
  validationStatus: 'accepte' | 'rejete' | 'en_attente';
  price: number;
  location: string;
  coordinates: [number, number];
  surface: number;
  images: string[];
  ownerId: string;
  createdDate: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'loyer' | 'frais_reservation' | 'abonnement' | 'commission';
  date: string;
  status: 'paye' | 'en_attente' | 'annule';
  userId: string;
  propertyId?: string;
  description: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  ownerId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'actif' | 'expire' | 'resilié';
  signatureStatus: 'en_attente' | 'signe';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: 'lu' | 'non_lu';
  type: 'message' | 'notification';
  flagged?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  type: 'banque' | 'assurance' | 'maintenance';
  contact: string;
  email: string;
  services: string[];
  contractEnd?: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface Statistics {
  totalUsers: number;
  totalProperties: number;
  totalTransactions: number;
  totalRevenue: number;
  usersByCity: Record<string, number>;
  propertiesByType: Record<string, number>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  conversionRate: number;
}