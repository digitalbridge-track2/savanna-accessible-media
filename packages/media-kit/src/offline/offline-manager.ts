export interface PackageAsset {
  id: string;
  url: string;
  sizeBytes?: number;
}

export interface PackageDownloadRecord {
  lessonId: string;
  packageId: string;
  packageName: string;
  status: "idle" | "downloading" | "ready" | "error";
  totalBytes: number;
  downloadedBytes: number;
  timestamp: number;
  error?: string;
}

export interface LessonProgressRecord {
  lessonId: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: number;
}

const DB_NAME = "abugida-media";
const DB_VERSION = 1;

export class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private cacheName = "abugida-offline-v1";

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("preferences")) {
          db.createObjectStore("preferences");
        }
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "lessonId" });
        }
        if (!db.objectStoreNames.contains("packages")) {
          db.createObjectStore("packages", { keyPath: "packageKey" });
        }
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };

      req.onerror = () => {
        console.warn("IndexedDB unavailable, falling back to memory/localStorage");
        resolve();
      };
    });
  }

  // --- Progress Tracking (Local-first) ---

  async saveProgress(record: LessonProgressRecord): Promise<void> {
    await this.init();
    if (!this.db) {
      try {
        localStorage.setItem(`progress_${record.lessonId}`, JSON.stringify(record));
      } catch {}
      return;
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction("progress", "readwrite");
      const store = tx.objectStore("progress");
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getProgress(lessonId: string): Promise<LessonProgressRecord | null> {
    await this.init();
    if (!this.db) {
      try {
        const raw = localStorage.getItem(`progress_${lessonId}`);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction("progress", "readonly");
      const store = tx.objectStore("progress");
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  // --- 3G Offline Package Download Engine ---

  async downloadPackage(
    lessonId: string,
    packageId: string,
    packageName: string,
    assetUrls: string[],
    onProgress: (percent: number, loaded: number, total: number) => void
  ): Promise<boolean> {
    await this.init();
    const packageKey = `${lessonId}:${packageId}`;

    if (!("caches" in window)) {
      throw new Error("Cache Storage API is not supported in this browser.");
    }

    try {
      const cache = await caches.open(this.cacheName);
      let downloaded = 0;
      const total = assetUrls.length;

      for (const url of assetUrls) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch asset: ${url} (${response.status})`);
        }
        await cache.put(url, response.clone());
        downloaded++;
        const pct = Math.round((downloaded / total) * 100);
        onProgress(pct, downloaded, total);
      }

      // Record ready status in IndexedDB
      await this.savePackageRecord({
        packageKey,
        lessonId,
        packageId,
        packageName,
        status: "ready",
        totalBytes: 3200000,
        downloadedBytes: 3200000,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      await this.savePackageRecord({
        packageKey,
        lessonId,
        packageId,
        packageName,
        status: "error",
        totalBytes: 3200000,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: err instanceof Error ? err.message : "Download failed",
      });
      throw err;
    }
  }

  async isPackageReady(lessonId: string, packageId: string): Promise<boolean> {
    await this.init();
    const packageKey = `${lessonId}:${packageId}`;
    const rec = await this.getPackageRecord(packageKey);
    return rec?.status === "ready";
  }

  private async savePackageRecord(data: any): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db!.transaction("packages", "readwrite");
      const store = tx.objectStore("packages");
      store.put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  private async getPackageRecord(packageKey: string): Promise<any | null> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      const tx = this.db!.transaction("packages", "readonly");
      const store = tx.objectStore("packages");
      const req = store.get(packageKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }
}

export const offlineStorage = new OfflineStorageManager();
