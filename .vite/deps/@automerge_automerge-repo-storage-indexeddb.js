import {
  __publicField
} from "./chunk-SNAQBZPT.js";

// node_modules/@automerge/automerge-repo-storage-indexeddb/dist/index.js
var IndexedDBStorageAdapter = class {
  /** Create a new {@link IndexedDBStorageAdapter}.
   * @param database - The name of the database to use. Defaults to "automerge".
   * @param store - The name of the object store to use. Defaults to "documents".
   */
  constructor(database = "automerge", store = "documents") {
    __publicField(this, "database");
    __publicField(this, "store");
    __publicField(this, "dbPromise");
    this.database = database;
    this.store = store;
    this.dbPromise = this.createDatabasePromise();
  }
  createDatabasePromise() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.database, 1);
      request.onerror = () => {
        reject(request.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(this.store);
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };
    });
  }
  async load(keyArray) {
    const db = await this.dbPromise;
    const transaction = db.transaction(this.store);
    const objectStore = transaction.objectStore(this.store);
    const request = objectStore.get(keyArray);
    return new Promise((resolve, reject) => {
      transaction.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result && typeof result === "object" && "binary" in result) {
          resolve(result.binary);
        } else {
          resolve(void 0);
        }
      };
    });
  }
  async save(keyArray, binary) {
    const db = await this.dbPromise;
    const transaction = db.transaction(this.store, "readwrite");
    const objectStore = transaction.objectStore(this.store);
    objectStore.put({ key: keyArray, binary }, keyArray);
    return new Promise((resolve, reject) => {
      transaction.onerror = () => {
        reject(transaction.error);
      };
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }
  async remove(keyArray) {
    const db = await this.dbPromise;
    const transaction = db.transaction(this.store, "readwrite");
    const objectStore = transaction.objectStore(this.store);
    objectStore.delete(keyArray);
    return new Promise((resolve, reject) => {
      transaction.onerror = () => {
        reject(transaction.error);
      };
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }
  async loadRange(keyPrefix) {
    const db = await this.dbPromise;
    const lowerBound = keyPrefix;
    const upperBound = [...keyPrefix, "￿"];
    const range = IDBKeyRange.bound(lowerBound, upperBound);
    const transaction = db.transaction(this.store);
    const objectStore = transaction.objectStore(this.store);
    const request = objectStore.openCursor(range);
    const result = [];
    return new Promise((resolve, reject) => {
      transaction.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          result.push({
            data: cursor.value.binary,
            key: cursor.key
          });
          cursor.continue();
        } else {
          resolve(result);
        }
      };
    });
  }
  async removeRange(keyPrefix) {
    const db = await this.dbPromise;
    const lowerBound = keyPrefix;
    const upperBound = [...keyPrefix, "￿"];
    const range = IDBKeyRange.bound(lowerBound, upperBound);
    const transaction = db.transaction(this.store, "readwrite");
    const objectStore = transaction.objectStore(this.store);
    objectStore.delete(range);
    return new Promise((resolve, reject) => {
      transaction.onerror = () => {
        reject(transaction.error);
      };
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }
};
export {
  IndexedDBStorageAdapter
};
//# sourceMappingURL=@automerge_automerge-repo-storage-indexeddb.js.map
