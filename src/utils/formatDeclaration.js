import { countryCallingCodes, defaultCountryCallingCode } from '../data/countryCallingCodes';

export function formatMachineLabel(machine) {
  return `${machine.categorie} | Parc ${machine.numeroParc} | ${machine.marque || '-'} | ${machine.type || '-'} | ${machine.localisation}`;
}

export function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('fr-FR');
}

export function formatDisplayTime(timeValue) {
  return timeValue || '';
}

export function formatPhoneNumber(phoneValue, countryCode = defaultCountryCallingCode.code) {
  const digits = String(phoneValue || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const selectedCountry =
    countryCallingCodes.find((item) => item.code === countryCode) || defaultCountryCallingCode;
  const dialDigits = selectedCountry.dialCode.replace('+', '');

  let normalized = digits;

  if (normalized.startsWith(dialDigits)) {
    normalized = normalized.slice(dialDigits.length);
  }

  if (selectedCountry.code === 'MA' && normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  return `${selectedCountry.dialCode} ${normalized}`;
}

function detailedEntries(ids, machines) {
  return ids
    .map((id) => machines.find((machine) => machine.id === id))
    .filter(Boolean)
    .sort((left, right) => {
      if (left.categorie !== right.categorie) {
        return left.categorie.localeCompare(right.categorie);
      }

      return left.numeroParc.localeCompare(right.numeroParc, undefined, { numeric: true });
    });
}

export function buildMachineGroups(selectedMachines, machines) {
  const entries = detailedEntries(selectedMachines, machines);

  return entries.reduce((accumulator, machine) => {
    const existingGroup = accumulator.find((group) => group.category === machine.categorie);

    if (existingGroup) {
      existingGroup.machines.push(machine);
      existingGroup.parcNumbers.push(machine.numeroParc);
      return accumulator;
    }

    accumulator.push({
      category: machine.categorie,
      machines: [machine],
      parcNumbers: [machine.numeroParc],
    });

    return accumulator;
  }, []);
}

export function buildDeclarationSummary({ formData, selectedMachines, machines }) {
  const availableMachines = detailedEntries(selectedMachines, machines);
  const availableGroups = buildMachineGroups(selectedMachines, machines);

  return {
    availableMachines,
    availableGroups,
    remarques: formData.notes?.trim() || '',
    metrics: {
      available: availableMachines.length,
      categories: availableGroups.length,
    },
    hasAnyDeclaration: availableMachines.length > 0,
  };
}

export function formatDeclarationEmail({ formData, selectedMachines, machines }) {
  const summary = buildDeclarationSummary({
    formData,
    selectedMachines,
    machines,
  });

  const formattedDate = formatDisplayDate(formData.date);
  const lines = summary.availableGroups.map(
    (group) => `- ${group.category}: ${group.parcNumbers.join(', ')}`,
  );

  const subject = `Déclaration machines disponibles - ${formData.localisation} - ${formData.fullName} - ${formattedDate}`;
  const body = `Bonjour,

Je suis ${formData.fullName} de la ville / du site ${formData.localisation}.

Veuillez trouver ci-dessous la déclaration des machines disponibles.

Société / Agence: ${formData.company || '-'}
Téléphone: ${formatPhoneNumber(formData.phone, formData.phoneCountry) || '-'}
Email expéditeur: ${formData.email || '-'}
Date: ${formattedDate}
Heure: ${formatDisplayTime(formData.time) || '-'}

Machines disponibles:
${lines.length ? lines.join('\n') : 'Aucune machine disponible déclarée'}

Remarques:
${summary.remarques || 'Aucune remarque'}

Cordialement,
${formData.fullName}`;

  return {
    subject,
    body,
    replyTo: formData.email,
    senderName: formData.fullName,
    localisation: formData.localisation,
    date: formattedDate,
    time: formatDisplayTime(formData.time),
  };
}
