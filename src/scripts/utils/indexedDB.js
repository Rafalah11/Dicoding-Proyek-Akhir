import ToastUtil from "./toast.js";

const DB_NAME = "app-stories";
const DB_VERSION = 1;
const STORIES_STORE = "stories";
const PENDING_STORIES_STORE = "pending-stories";

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PENDING_STORIES_STORE)) {
        db.createObjectStore(PENDING_STORIES_STORE, { autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function saveStories(stories) {
  const db = await openDB();
  const transaction = db.transaction([STORIES_STORE], "readwrite");
  const store = transaction.objectStore(STORIES_STORE);

  stories.forEach((story) => {
    store.put(story);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getStories() {
  const db = await openDB();
  const transaction = db.transaction([STORIES_STORE], "readonly");
  const store = transaction.objectStore(STORIES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingStory(story) {
  const db = await openDB();
  const transaction = db.transaction([PENDING_STORIES_STORE], "readwrite");
  const store = transaction.objectStore(PENDING_STORIES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.add(story);
    request.onsuccess = () => {
      console.log("Cerita tersimpan dengan ID:", request.result);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingStories() {
  const db = await openDB();
  const transaction = db.transaction([PENDING_STORIES_STORE], "readonly");
  const store = transaction.objectStore(PENDING_STORIES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.openCursor();
    const stories = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // Tambahkan kunci (ID) sebagai properti id pada objek cerita
        stories.push({ id: cursor.key, ...cursor.value });
        cursor.continue();
      } else {
        console.log("Cerita tertunda yang diambil:", stories);
        resolve(stories);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function deletePendingStory(id) {
  if (!id || isNaN(id)) {
    console.error("ID cerita tidak valid:", id);
    throw new Error("ID cerita tidak valid");
  }

  const db = await openDB();
  const transaction = db.transaction([PENDING_STORIES_STORE], "readwrite");
  const store = transaction.objectStore(PENDING_STORIES_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(Number(id));
    request.onsuccess = () => {
      console.log("Cerita dengan ID", id, "berhasil dihapus dari IndexedDB");
      ToastUtil.showToast("Cerita tertunda berhasil dihapus");
      resolve();
    };
    request.onerror = () => {
      console.error("Gagal menghapus cerita dengan ID:", id, request.error);
      ToastUtil.showToast("Gagal menghapus cerita.");
      reject(request.error);
    };
  });
}
