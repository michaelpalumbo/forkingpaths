import { create } from 'zustand';
import * as Automerge from 'automerge';
import repo from './automergeRepo'; // Import the Automerge Repo

// Initial Automerge document
const initialDoc = Automerge.from({ count: 0, nodes: [], edges: [] });

// Zustand store
const useAutomergeStore = create((set) => ({
  doc: null, // Initially null until the doc is created or retrieved

  setDoc: (changeFn) => 
    set((state) => {
      if (state.doc) {
        const newDoc = Automerge.change(state.doc, changeFn);
        return { doc: newDoc };
      }
      return state;
    }),
  setHandle: (handle) => set({ handle }), // Add handle to store
}));

export default useAutomergeStore;
