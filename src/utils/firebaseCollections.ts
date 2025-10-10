const collections = {
  ASSISTANCE_VIRTUELLES: "AssistanceVirtuelles",
  AVIS_NOTATION_PROPRIETES: "AvisNotationProprites",
  CATEGORIES: "Categories",
  CERTIFICATES: "Certificates",
  CONSEILS: "Conseils",
  CONTRATS: "Contrats",
  FAVORIS: "Favoris",
  NOTIFICATIONS: "Notifications",
  PROPRIETES: "Proprietes",
  PROPRIETES_USAGE_COMMERCIAL: "ProprietesUsageCommercial",
  PROPRIETES_USAGE_RESIDENTIEL: "ProprietesUsageResidentiel",
  TYPE_CONSEILS: "TypeConseils",
  TYPE_USERS: "TypeUsers",
  USERS: "Users",
  CHATS: "chats",
  CONTACTS: "contacts",
  USER_CHATS: "user_chats",
};

export default collections;
export const USER_TYPES = {
  VISITEUR: {
    id: 1,
    label: "Visiteur",
    key: "visiteur",
  },
  LOCATAIRE: {
    id: 2,
    label: "Locataire",
    key: "locataire",
  },
  PROPRIETAIRE: {
    id: 3,
    label: "Propriétaire",
    key: "proprietaire",
  },
  ADMIN: {
    id: 4,
    label: "Admin",
    key: "admin",
  },
  CONTROLEUR: {
    id: 5,
    label: "Contrôleur",
    key: "controleur",
  },
  AGENCE_IMMOBILIERE: {
    id: 6,
    label: "Agence immobilière",
    key: "agence_immobiliere",
  },
  AGENT_IMMOBILIER: {
    id: 7,
    label: "Agent immobilier",
    key: "agent_immobilier",
  },
  CLIENT: {
    id: 8,
    label: "Client",
    key: "client",
  },
  APPARTEMENT: {
    id: 9,
    label: "Appartement",
    key: "appartement",
  },
  SUPER_ADMIN: {
    id: 10,
    label: "SuperAdmin",
    key: "super_admin",
  },
  PARTENAIRE: {
    id: 11,
    label: "Partenaire",
    key: "partenaire",
  },
};
// export const ROLE_ENUM = {
//   // Rôles principaux basés sur le mapping 1:client, 2:proprietaire, etc.
//   CLIENT: {
//     id: 1,
//     label: "Client",
//     key: "client",
//   },
//   PROPRIETAIRE: {
//     id: 2,
//     label: "Propriétaire",
//     key: "proprietaire",
//   },
//   AGENT: {
//     id: 3,
//     label: "Agent",
//     key: "agent",
//   },
//   AGENCE: {
//     id: 4,
//     label: "Agence",
//     key: "agence",
//   },

//   // Rôles additionnels (Visiteur, Admin, etc.)
//   // On leur attribue des IDs séquentiels à partir de 5
//   VISITEUR: {
//     id: 5,
//     label: "Visiteur",
//     key: "visiteur",
//   },
//   CONTROLEUR: {
//     id: 6,
//     label: "Contrôleur",
//     key: "controleur",
//   },
//   ADMIN: {
//     id: 7,
//     label: "Admin",
//     key: "admin",
//   },
//   SUPER_ADMIN: {
//     id: 8,
//     label: "SuperAdmin",
//     key: "super_admin",
//   },
//   LOCATAIRE: {
//     id: 9,
//     label: "Locataire",
//     key: "locataire",
//   },
//   PARTENAIRE: {
//     id: 10,
//     label: "Partenaire",
//     key: "partenaire",
//   },
// };

export const roleMap = Object.values(USER_TYPES).reduce((acc, role) => {
  acc[role.id] = role.key;
  return acc;
}, {} as { [key: number]: string });
// get all id and labels
export const rolesList = Object.values(USER_TYPES).map((role) => ({
  id: role.id,
  label: role.label,
}));
export const getRoleIdByLabel = (label: string) => {
  const role = Object.values(USER_TYPES).find(
    (role) => role.label.toLowerCase() === label.toLowerCase()
  );
  return role ? role.id : null;
}

// get label by id
export const getRoleLabelById = (id: number) => {
  const role = Object.values(USER_TYPES).find((role) => role.id === id);
  return role ? role.label : "Inconnu";
};