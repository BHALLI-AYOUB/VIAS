import { localisations } from '../data/localisations';
import { machines as inventoryMachines } from '../data/machines';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { mapInventoryMachineToRow, normalizeMachineRow } from '../utils/historyHelpers';

export function getInventorySeedRows() {
  return inventoryMachines.map((machine) => ({
    numero_parc: machine.numeroParc,
    categorie: machine.categorie,
    marque: machine.marque || null,
    modele: machine.type || null,
    localisation_actuelle: machine.localisation || null,
    statut_actuel: 'disponible',
  }));
}

function filterInventoryMachines(filters = {}) {
  return inventoryMachines
    .map(mapInventoryMachineToRow)
    .filter((machine) => {
      const searchHaystack = [machine.numero_parc, machine.categorie, machine.marque, machine.modele, machine.localisation_actuelle]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !filters.search || searchHaystack.includes(filters.search.toLowerCase());
      const matchesCategory = !filters.categorie || machine.categorie === filters.categorie;
      const matchesLocation = !filters.localisationActuelle || machine.localisation_actuelle === filters.localisationActuelle;
      return matchesSearch && matchesCategory && matchesLocation;
    });
}

export async function searchMachines(filters = {}) {
  if (!isSupabaseConfigured) {
    return filterInventoryMachines(filters);
  }

  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('machines')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters.search) {
      const value = filters.search.replaceAll(',', ' ');
      query = query.or(
        `numero_parc.ilike.%${value}%,categorie.ilike.%${value}%,marque.ilike.%${value}%,modele.ilike.%${value}%`,
      );
    }

    if (filters.categorie) {
      query = query.eq('categorie', filters.categorie);
    }

    if (filters.localisationActuelle) {
      query = query.eq('localisation_actuelle', filters.localisationActuelle);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[machineService.searchMachines] Supabase query failed.', error);
      throw error;
    }

    return (data || []).map(normalizeMachineRow);
  } catch (error) {
    console.error('[machineService.searchMachines] Unexpected error.', error);
    throw error;
  }
}

export async function getMachineById(id) {
  if (!isSupabaseConfigured) {
    const machine = filterInventoryMachines({}).find((item) => item.id === id || item.numero_parc === id);
    return machine ? normalizeMachineRow(machine) : null;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('machines').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }

      console.error('[machineService.getMachineById] Supabase query failed.', error);
      throw error;
    }

    return normalizeMachineRow(data);
  } catch (error) {
    console.error('[machineService.getMachineById] Unexpected error.', error);
    throw error;
  }
}

export async function upsertInventoryMachines(seedRows = getInventorySeedRows()) {
  if (!isSupabaseConfigured) {
    return { count: seedRows.length, skipped: true };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('machines')
      .upsert(seedRows, { onConflict: 'numero_parc' });

    if (error) {
      console.error('[machineService.upsertInventoryMachines] Supabase upsert failed.', error);
      throw error;
    }

    return { count: seedRows.length, skipped: false };
  } catch (error) {
    console.error('[machineService.upsertInventoryMachines] Unexpected error.', error);
    throw error;
  }
}

export function getHistoryFilterOptions() {
  return {
    categories: [...new Set(inventoryMachines.map((machine) => machine.categorie))].sort(),
    locations: localisations,
  };
}
