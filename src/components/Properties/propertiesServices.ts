// services/propertyService.ts (business logic for property operations)
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust path
import collections from "../../utils/firebaseCollections";
import type { FirestoreProperty } from "../../types";
import { sendPropertyNotificationEmail } from "../../utils/emailTemplates";

export interface EmailData {
  to: string;
  currency: string;
  frequency: string;
  propertyTitle: string;
  propertyType: string;
  owner?: {
    name: string;
    email: string;
    phone?: string;
  };
  price: number;
  propertyAddress: string;
  actionType: "approve" | "reject" | "cancel";
}

export async function updatePropertyValidationService(
  propertyId: string,
  status: "accepte" | "rejete" | "annule",
  emailData: EmailData
): Promise<void> {
  try {
    const propertyRef = doc(db, collections.PROPRIETES, propertyId);
    await updateDoc(propertyRef, {
      validationStatus: status,
      updated_at: serverTimestamp(),
    });

    // Fetch the updated property data for email if needed
    // const propertySnap = await getDoc(propertyRef);
    // if (!propertySnap.exists()) {
    //   throw new Error("Propriété non trouvée");
    // }
    // const property = { id: propertySnap.id, ...propertySnap.data() } as FirestoreProperty;

    // Send notification email (business logic)
    await sendPropertyNotificationEmail({
      ...emailData,
      actionType: status === "accepte" ? "approve" : status === "rejete" ? "reject" : "cancel",
    });
  } catch (error: any) {
    throw new Error(error.message || "Erreur lors de la mise à jour de la validation");
  }
}

// Additional service functions can be added here, e.g., prepareEmailData if needed