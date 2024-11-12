// indexedDB.js
import { openDB } from 'idb';

const dbPromise = openDB('automerge-docs', 1, {
    upgrade(db) {
        db.createObjectStore('documents', { keyPath: 'docId' });
    },
});

export async function saveDocument(docId, doc) {
    const db = await dbPromise;
    await db.put('documents', { docId, doc });
}

export async function loadDocument(docId) {
    const db = await dbPromise;
    const entry = await db.get('documents', docId);
    return entry ? entry.doc : null;
}

export async function deleteDocument(docId) {
    const db = await dbPromise;
    await db.delete('documents', docId);
}
