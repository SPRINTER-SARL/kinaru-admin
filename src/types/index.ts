
export interface FirestoreUser {
  uid: string;
  nom: string;
  prenom: string;
}

export interface FirestoreProperty {
  id: string;
  title: string;
}

export interface FirestoreContract {
  id: string;
  locataireId: string;
  proprietaireId: string;
  proprieteId: string;
  dateDebutContrat: string;
  dateFinContrat: string;
  montantParFrequence: string;
  montantCaution: number;
  montantPrevu: number;
  montantVerse: number;
  devise: string;
  frequence: string;
  moyentPayment: string[];
  paiementDueDate: string;
  delaiRestitutionCaution: string;
  durrePreAvis: string;
  durreeDuContrat: string;
  statut: number; // 1 = actif, 0 = expiré, 2 = résilié
  etat: number; // Same logic as statut
  signatureStatus: string; // en_attente, signe
  created_at: string;
  updated_at: string;
  favorite: number | null;
}



export interface LocalImage {
  id: string;
  name: string;
  progress: number;
  size: string;
  uri: string;
  viewable: boolean;
}

export interface FirestoreProperty {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  statut: number; // 0 = libre, 1 = occupé, 2 = réservé
  etat: number; // Same logic as statut
  validationStatus: string; // accepte, rejete, en_attente
  prix: number;
  devise: string;
  frequence: string;
  adresse: string;
  arrondissement: string;
  quartier: string;
  ville: string;
  region: string;
  pays: string;
  nomType: string;
  nombrePieces: string;
  nombreSalleBains: string;
  surface: string;
  favorite: number;
  certificate: string;
  images: string[];
  localImages: LocalImage[];
  position?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
  usage: string;
}

export interface User {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  addresse: string;
  statut: number; // 0 = en attente, 1 = actif, 2 = banni
  etat: number; // même logique que statut
  typeUsersId: number; // 1 = client, 2 = propriétaire, 3 = agent, 4 = agence
  photoProfil?: string;
  fcmToken?: string;
  CNIDateDelivrer?: string;
  cniExpirationDate?: string;
  cniNumber?: string;
  cniRecto?: string;
  cniVerso?: string;
  notificationPrefs?: {
    messages: boolean;
    newProperties: boolean;
    payments: boolean;
    reservations: boolean;
    visits: boolean;
  };
  lastUpdated: string; // ISO date
}
// export interface FirestoreProperty {
//   id: string;
//   ownerId: string;
//   titre: string;
//   description: string;
//   type: "residentiel" | "commercial";
//   statut: "libre" | "occupe" | "reserve";
//   validationStatus: "accepte" | "rejete" | "en_attente";
//   prix: number;
//   location: string;
//   coordinates?: [number, number];
//   surface?: number;
//   images: string[];
//   createdDate: string;
// }

export interface FirestoreTransaction {
  id: string;
  userId: string;
  propertyId?: string;
  montant: number;
  type: "loyer" | "frais_reservation" | "abonnement" | "commission";
  date: string;
  statut: "paye" | "en_attente" | "annule";
  description?: string;
}

// export interface FirestoreContract {
//   id: string;
//   tenantId: string;
//   ownerId: string;
//   propertyId: string;
//   startDate: string;
//   endDate: string;
//   monthlyRent: number;
//   statut: "actif" | "expire" | "resilie";
//   signatureStatus: "en_attente" | "signe";
// }

export interface FirestoreMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  statut: "lu" | "non_lu";
  type: "message" | "notification";
  flagged?: boolean;
}
