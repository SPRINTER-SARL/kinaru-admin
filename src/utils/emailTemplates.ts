import axios from 'axios';

interface KinaruEmailProps {
  to: string;
  propertyTitle: string;
  propertyType: string;
  propertyAddress: string;
  price: number;
  currency: string;
  frequency: string;
  tenant?: {
    name: string;
    email: string;
    phone?: string;
  };
  owner?: {
    name: string;
    email: string;
    phone?: string;
  };
  contractDetails?: {
    startDate: string;
    endDate: string;
    contractNumber: string;
  };
}

export async function sendPropertyNotificationEmail({
  to,
  propertyTitle,
  propertyType,
  propertyAddress,
  price,
  currency,
  frequency,
  tenant,
  owner,
  contractDetails,
}: KinaruEmailProps) {
  const htmlPart = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header avec logo -->
      <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f97316;">
        <img src="https://kinaru.com/logo.png" alt="Kinaru" style="height: 40px; margin-bottom: 16px;">
        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">Notification Immobilière</h1>
      </div>

      <!-- Contenu principal -->
      <div style="margin-bottom: 32px;">
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">
          Une nouvelle activité a été enregistrée concernant la propriété suivante :
        </p>

        <!-- Carte de la propriété -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h2 style="color: #f97316; font-size: 20px; margin: 0 0 16px 0;">${propertyTitle}</h2>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; min-width: 120px;">Type :</span>
              <span style="color: #1e293b; font-weight: 500;">${propertyType}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; min-width: 120px;">Adresse :</span>
              <span style="color: #1e293b;">${propertyAddress}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; min-width: 120px;">Prix :</span>
              <span style="color: #1e293b; font-weight: 600;">
                ${price.toLocaleString()} ${currency}/${frequency}
              </span>
            </div>
          </div>
        </div>

        ${contractDetails ? `
          <!-- Détails du contrat -->
          <div style="background: #fff7ed; border-radius: 8px; padding: 24px; margin: 20px 0; border: 1px solid #fed7aa;">
            <h3 style="color: #ea580c; font-size: 18px; margin: 0 0 16px 0;">Détails du contrat</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #9a3412; min-width: 120px;">N° Contrat :</span>
                <span style="color: #431407; font-weight: 500;">${contractDetails.contractNumber}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #9a3412; min-width: 120px;">Période :</span>
                <span style="color: #431407;">Du ${contractDetails.startDate} au ${contractDetails.endDate}</span>
              </div>
            </div>
          </div>
        ` : ''}

        ${tenant || owner ? `
          <!-- Informations des parties -->
          <div style="display: grid; grid-template-columns: 1fr${tenant && owner ? ' 1fr' : ''}; gap: 16px; margin-top: 24px;">
            ${tenant ? `
              <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; border: 1px solid #bae6fd;">
                <h4 style="color: #0369a1; font-size: 16px; margin: 0 0 12px 0;">Locataire</h4>
                <div style="font-size: 14px; color: #0c4a6e;">
                  <p style="margin: 4px 0;">${tenant.name}</p>
                  <p style="margin: 4px 0;">${tenant.email}</p>
                  ${tenant.phone ? `<p style="margin: 4px 0;">${tenant.phone}</p>` : ''}
                </div>
              </div>
            ` : ''}
            ${owner ? `
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; border: 1px solid #bbf7d0;">
                <h4 style="color: #166534; font-size: 16px; margin: 0 0 12px 0;">Propriétaire</h4>
                <div style="font-size: 14px; color: #14532d;">
                  <p style="margin: 4px 0;">${owner.name}</p>
                  <p style="margin: 4px 0;">${owner.email}</p>
                  ${owner.phone ? `<p style="margin: 4px 0;">${owner.phone}</p>` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px;">
          Pour plus d'informations, connectez-vous à votre espace Kinaru
        </p>
        <div style="margin-top: 16px;">
          <a href="https://admin.kinaru.com" 
             style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Accéder à mon espace
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          © ${new Date().getFullYear()} Kinaru. Tous droits réservés.<br>
          Pour toute assistance, contactez <a href="mailto:support@kinaru.com" style="color: #f97316; text-decoration: none;">support@kinaru.com</a>
        </p>
      </div>
    </div>
  `;

  const response = await axios.post(
    "/sendEmails",
    {
      emails: [to],
      subject: `Kinaru - Nouvelle notification pour ${propertyTitle}`,
      senderName: "Kinaru Immobilier",
      textPart: `Notification concernant la propriété ${propertyTitle}.\nType: ${propertyType}\nAdresse: ${propertyAddress}\nPrix: ${price} ${currency}/${frequency}`,
      htmlPart,
    }
  );

  console.log("Email envoyé:", response.data);
  return response.data;
}