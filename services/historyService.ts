
import { QRHistoryEntry } from '../types';

const STORAGE_KEY = 'freeqr_history';
const MAX_ENTRIES = 30;

export const loadHistory = (): QRHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const persist = (entries: QRHistoryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full — drop oldest entries and retry
    const trimmed = entries.slice(0, Math.floor(entries.length / 2));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch {}
  }
};

export const addHistoryEntry = (entries: QRHistoryEntry[], entry: QRHistoryEntry): QRHistoryEntry[] => {
  // Deduplicate by qrValue so same QR doesn't pile up
  const filtered = entries.filter(e => e.qrValue !== entry.qrValue);
  const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
  persist(next);
  return next;
};

export const removeHistoryEntry = (entries: QRHistoryEntry[], id: string): QRHistoryEntry[] => {
  const next = entries.filter(e => e.id !== id);
  persist(next);
  return next;
};

export const clearAllHistory = (): QRHistoryEntry[] => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
