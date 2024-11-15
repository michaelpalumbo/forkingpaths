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
    try {
        const db = await dbPromise;
        // Open a transaction on the 'documents' store with readwrite permissions
        const tx = db.transaction('documents', 'readwrite');
        // Access the object store and delete the specified document
        await tx.store.delete(docId);
        // Ensure the transaction completes
        await tx.done;
        console.log(`Document with ID ${docId} successfully deleted.`);

    } catch (error) {
        console.error(`Failed to delete document with ID ${docId}:`, error);
    }
}