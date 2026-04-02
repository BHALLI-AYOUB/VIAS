import { machines as inventoryMachines } from '../data/machines';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

function mapSelectedMachineIds(selectedMachineIds = []) {
  return inventoryMachines.filter((machine) => selectedMachineIds.includes(machine.id));
}

async function ensureMachineRows(supabase, selectedMachines) {
  const numeroParcList = selectedMachines.map((machine) => machine.numeroParc);

  const { data: existingRows, error: fetchError } = await supabase
    .from('machines')
    .select('*')
    .in('numero_parc', numeroParcList);

  if (fetchError) {
    console.error('[declarationService.ensureMachineRows] Failed to fetch existing machines.', fetchError);
    throw fetchError;
  }

  const existingByParc = new Map((existingRows || []).map((machine) => [machine.numero_parc, machine]));
  const missingRows = selectedMachines
    .filter((machine) => !existingByParc.has(machine.numeroParc))
    .map((machine) => ({
      numero_parc: machine.numeroParc,
      categorie: machine.categorie,
      marque: machine.marque || null,
      modele: machine.type || null,
      localisation_actuelle: machine.localisation || null,
      statut_actuel: 'disponible',
    }));

  if (missingRows.length) {
    const { data: insertedRows, error: insertError } = await supabase
      .from('machines')
      .insert(missingRows)
      .select();

    if (insertError) {
      console.error('[declarationService.ensureMachineRows] Failed to insert missing machines.', insertError);
      throw insertError;
    }

    insertedRows.forEach((machine) => {
      existingByParc.set(machine.numero_parc, machine);
    });
  }

  return existingByParc;
}

export async function persistDeclaration({ formData, selectedMachineIds, canalEnvoi }) {
  if (!isSupabaseConfigured) {
    return {
      declarationId: null,
      movementCount: 0,
      skipped: true,
    };
  }

  const selectedMachines = mapSelectedMachineIds(selectedMachineIds);
  const supabase = getSupabaseClient();

  const { data: declaration, error: declarationError } = await supabase
    .from('daily_declarations')
    .insert({
      nom_complet: formData.fullName,
      telephone: formData.phone,
      email: formData.email || null,
      societe: formData.company || null,
      localisation: formData.localisation,
      date_declaration: formData.date,
      remarque: formData.notes || null,
      canal_envoi: canalEnvoi,
    })
    .select()
    .single();

  if (declarationError) {
    console.error('[declarationService.persistDeclaration] Failed to insert declaration header.', declarationError);
    throw declarationError;
  }

  if (!selectedMachines.length) {
    return {
      declarationId: declaration.id,
      movementCount: 0,
      skipped: false,
    };
  }

  const machineRowsByParc = await ensureMachineRows(supabase, selectedMachines);
  const declarationItems = selectedMachines.map((machine) => {
    const dbMachine = machineRowsByParc.get(machine.numeroParc);

    return {
      declaration_id: declaration.id,
      machine_id: dbMachine.id,
      numero_parc: machine.numeroParc,
      categorie: machine.categorie,
      statut_declare: 'disponible',
      localisation_declaration: formData.localisation,
    };
  });

  const { error: itemsError } = await supabase.from('declaration_machine_items').insert(declarationItems);

  if (itemsError) {
    console.error('[declarationService.persistDeclaration] Failed to insert declaration items.', itemsError);
    throw itemsError;
  }

  const movementsToInsert = [];
  const machinesToUpdate = [];

  selectedMachines.forEach((machine) => {
    const dbMachine = machineRowsByParc.get(machine.numeroParc);
    const previousLocation = dbMachine.localisation_actuelle || machine.localisation || null;
    const nextLocation = formData.localisation;

    if (previousLocation && previousLocation !== nextLocation) {
      movementsToInsert.push({
        machine_id: dbMachine.id,
        numero_parc: machine.numeroParc,
        type_mouvement: 'transfert',
        localisation_depart: previousLocation,
        localisation_arrivee: nextLocation,
        chantier: nextLocation,
        remarque: formData.notes || null,
        declared_by: formData.fullName,
        source_declaration_id: declaration.id,
      });
    }

    machinesToUpdate.push({
      id: dbMachine.id,
      localisation_actuelle: nextLocation,
      statut_actuel: 'disponible',
    });
  });

  if (movementsToInsert.length) {
    const { error: movementsError } = await supabase.from('machine_movements').insert(movementsToInsert);

    if (movementsError) {
      console.error('[declarationService.persistDeclaration] Failed to insert machine movements.', movementsError);
      throw movementsError;
    }
  }

  if (machinesToUpdate.length) {
    const updateResults = await Promise.all(
      machinesToUpdate.map(async (machineUpdate) => {
        const { error } = await supabase
          .from('machines')
          .update({
            localisation_actuelle: machineUpdate.localisation_actuelle,
            statut_actuel: machineUpdate.statut_actuel,
          })
          .eq('id', machineUpdate.id);

        if (error) {
          console.error(
            `[declarationService.persistDeclaration] Failed to update machine ${machineUpdate.id}.`,
            error,
          );
          throw error;
        }

        return machineUpdate.id;
      }),
    );

    if (!updateResults.length) {
      console.warn('[declarationService.persistDeclaration] No machine rows were updated.');
    }
  }

  return {
    declarationId: declaration.id,
    movementCount: movementsToInsert.length,
    skipped: false,
  };
}
