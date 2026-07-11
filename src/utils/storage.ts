/**
 * Wrapper minimale su localStorage: non deve mai far crashare l'app se lo
 * storage non è disponibile (modalità privata di alcuni browser, storage
 * pieno, contesti senza `window`, ecc.) o se il contenuto salvato non è
 * più valido (es. dopo una modifica alla shape dei dati).
 */

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage non disponibile o pieno: la sessione continua a funzionare,
    // semplicemente senza persistenza.
  }
}
