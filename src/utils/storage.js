const STORAGE_KEY = 'vias-machine-declaration-draft-v1';

export function saveDraft(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadDraft() {
  const rawDraft = window.localStorage.getItem(STORAGE_KEY);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft);
  } catch {
    return null;
  }
}

export function clearDraft() {
  window.localStorage.removeItem(STORAGE_KEY);
}
