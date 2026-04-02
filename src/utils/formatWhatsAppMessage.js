import { buildDeclarationSummary, formatDisplayDate, formatDisplayTime, formatPhoneNumber } from './formatDeclaration';

const WHATSAPP_NUMBER = '212666536985';

export function buildWhatsAppUrl({ formData, selectedMachines, machines }) {
  const summary = buildDeclarationSummary({
    formData,
    selectedMachines,
    machines,
  });

  const availableLines = summary.availableGroups.map(
    (group) => `- ${group.category}: ${group.parcNumbers.join(', ')}`,
  );

  const message = `Bonjour,
Je suis ${formData.fullName} de la ville / du site ${formData.localisation}.

Voici la déclaration des machines disponibles :

${availableLines.length ? availableLines.join('\n') : 'Aucune machine disponible déclarée.'}

Téléphone : ${formatPhoneNumber(formData.phone, formData.phoneCountry) || '-'}
Date : ${formatDisplayDate(formData.date)}
Heure : ${formatDisplayTime(formData.time) || '-'}

Remarques :
${summary.remarques || 'Aucune remarque'}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
