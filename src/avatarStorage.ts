// Local IndexedDB / LocalStorage avatar cache (kept completely isolated from character JSON for security)
const DB_NAME = 'motor2d6_avatar_db';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function carregarTodosAvatares(): Promise<Record<string, string>> {
  const avatares: Record<string, string> = {};

  // 1. Try IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const keysRequest = store.getAllKeys();
    const valsRequest = store.getAll();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const keys = (keysRequest.result || []) as string[];
    const vals = (valsRequest.result || []) as string[];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] && vals[i]) {
        avatares[keys[i]] = vals[i];
      }
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage fallback / migration
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('motor2d6_av_')) {
        const charId = k.replace('motor2d6_av_', '');
        if (!avatares[charId]) {
          const val = localStorage.getItem(k);
          if (val) avatares[charId] = val;
        }
      }
    }
  } catch {
    // ignore
  }

  return avatares;
}

export async function salvarAvatarNoStorage(charId: string, dataUrl: string): Promise<void> {
  // Always try IndexedDB first
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, charId);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }

  // Also keep lightweight fallback in localStorage
  try {
    localStorage.setItem(`motor2d6_av_${charId}`, dataUrl);
  } catch {
    // ignore
  }
}

export async function removerAvatarDoStorage(charId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(charId);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(`motor2d6_av_${charId}`);
  } catch {
    // ignore
  }
}
