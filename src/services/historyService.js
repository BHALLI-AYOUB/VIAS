import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  buildTrajectorySummary,
  filterLocalMovements,
  getLatestMovement,
  normalizeMovementRow,
} from '../utils/historyHelpers';

export async function fetchMachineMovements(machineId, filters = {}) {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('machine_movements')
      .select('*')
      .eq('machine_id', machineId)
      .order('date_mouvement', { ascending: false });

    if (filters.typeMouvement) {
      query = query.eq('type_mouvement', filters.typeMouvement);
    }

    if (filters.localisationDepart) {
      query = query.eq('localisation_depart', filters.localisationDepart);
    }

    if (filters.localisationArrivee) {
      query = query.eq('localisation_arrivee', filters.localisationArrivee);
    }

    if (filters.dateStart) {
      query = query.gte('date_mouvement', `${filters.dateStart}T00:00:00`);
    }

    if (filters.dateEnd) {
      query = query.lte('date_mouvement', `${filters.dateEnd}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[historyService.fetchMachineMovements] Supabase query failed.', error);
      throw error;
    }

    return (data || []).map(normalizeMovementRow);
  } catch (error) {
    console.error('[historyService.fetchMachineMovements] Unexpected error.', error);
    throw error;
  }
}

export async function fetchLatestMovements(limit = 8) {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('machine_movements')
      .select('*')
      .order('date_mouvement', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[historyService.fetchLatestMovements] Supabase query failed.', error);
      throw error;
    }

    return (data || []).map(normalizeMovementRow);
  } catch (error) {
    console.error('[historyService.fetchLatestMovements] Unexpected error.', error);
    throw error;
  }
}

export async function fetchFilteredMovements(filters = {}) {
  if (!isSupabaseConfigured) {
    return filterLocalMovements([], filters);
  }

  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('machine_movements')
      .select('*')
      .order('date_mouvement', { ascending: false });

    if (filters.search) {
      const value = filters.search.replaceAll(',', ' ');
      query = query.or(
        `numero_parc.ilike.%${value}%,type_mouvement.ilike.%${value}%,localisation_depart.ilike.%${value}%,localisation_arrivee.ilike.%${value}%,chantier.ilike.%${value}%`,
      );
    }

    if (filters.typeMouvement) {
      query = query.eq('type_mouvement', filters.typeMouvement);
    }

    if (filters.localisationDepart) {
      query = query.eq('localisation_depart', filters.localisationDepart);
    }

    if (filters.localisationArrivee) {
      query = query.eq('localisation_arrivee', filters.localisationArrivee);
    }

    if (filters.dateStart) {
      query = query.gte('date_mouvement', `${filters.dateStart}T00:00:00`);
    }

    if (filters.dateEnd) {
      query = query.lte('date_mouvement', `${filters.dateEnd}T23:59:59`);
    }

    const { data, error } = await query.limit(filters.limit || 100);

    if (error) {
      console.error('[historyService.fetchFilteredMovements] Supabase query failed.', error);
      throw error;
    }

    return (data || []).map(normalizeMovementRow);
  } catch (error) {
    console.error('[historyService.fetchFilteredMovements] Unexpected error.', error);
    throw error;
  }
}

export async function createMovement(movementInput) {
  if (!isSupabaseConfigured) {
    return { skipped: true };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('machine_movements')
      .insert(movementInput)
      .select()
      .single();

    if (error) {
      console.error('[historyService.createMovement] Supabase insert failed.', error);
      throw error;
    }

    return normalizeMovementRow(data);
  } catch (error) {
    console.error('[historyService.createMovement] Unexpected error.', error);
    throw error;
  }
}

export async function getMachineHistoryBundle(machine, filters = {}) {
  const movements = await fetchMachineMovements(machine.id, filters);
  const trajectory = buildTrajectorySummary(movements, machine.localisation_actuelle);
  const latestMovement = getLatestMovement(movements);

  return {
    machine,
    movements,
    trajectory,
    latestMovement,
  };
}
