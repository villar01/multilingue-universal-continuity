export interface NotebookEntry {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  examplePt: string;
  langCode: string;
  scene?: string;
  addedAt: number;
  reviewed: number;
  starred: boolean;
  note?: string;
}

const STORAGE_KEY = "ml_notebook_entries";

export function loadNotebook(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotebook(entries: NotebookEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addToNotebook(entry: Omit<NotebookEntry, "id" | "addedAt" | "reviewed" | "starred">): NotebookEntry {
  const entries = loadNotebook();
  const existing = entries.find((savedEntry) => savedEntry.word === entry.word && savedEntry.langCode === entry.langCode);
  if (existing) {
    existing.reviewed += 1;
    saveNotebook(entries);
    return existing;
  }

  const newEntry: NotebookEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: Date.now(),
    reviewed: 0,
    starred: false,
  };
  entries.unshift(newEntry);
  saveNotebook(entries);
  return newEntry;
}
