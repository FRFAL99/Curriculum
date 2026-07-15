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

/**
 * Rimuove una o più chiavi da localStorage, ignorando errori (storage non
 * disponibile ecc.). Usato al boot per far ripartire il sito sempre "pulito"
 * (nessuna finestra aperta, chat vuota) senza però perdere la continuità
 * dentro la stessa sessione, dove la persistenza resta attiva.
 */
export function removeKeys(keys: string[]): void {
  try {
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    // Storage non disponibile: nulla da ripulire.
  }
}
