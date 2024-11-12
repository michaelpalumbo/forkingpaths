Identify Dependencies on automerge-repo

 List out all existing features in the web app that rely on automerge-repo, including:
 - Document creation and synchronization

    ```javascript
            const { DocHandle, Repo, isValidAutomergeUrl, DocumentId, Document } = await import('@automerge/automerge-repo');
    ```


 - History/versioning
 - Networking and storage

    ```javascript
        const { BrowserWebSocketClientAdapter } = await import('@automerge/automerge-repo-network-websocket');
        const { IndexedDBStorageAdapter } = await import("@automerge/automerge-repo-storage-indexeddb");
        const storage = new IndexedDBStorageAdapter("automerge");
        repo = new Repo({
            network: [new BrowserWebSocketClientAdapter('ws://localhost:3030')],
            // storage: LocalForageStorageAdapter, // Optional: use a storage adapter if needed
            storage: storage, // Optional: use a storage adapter if needed
        });
    ```