import { create } from 'zustand';
import * as Automerge from 'automerge';


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
