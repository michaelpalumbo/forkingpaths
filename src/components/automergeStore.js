import { create } from 'zustand';
import * as Automerge from 'automerge';

// Initial Automerge document
const initialDoc = Automerge.from({ count: 0, nodes: [], edges: [] });

// Zustand store
const useAutomergeStore = create((set) => ({
  doc: initialDoc,
  setDoc: (changeFn) => 
    set((state) => {
      const newDoc = Automerge.change(state.doc, changeFn);
      return { doc: newDoc };
    }),
}));

export default useAutomergeStore;
