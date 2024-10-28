import React, { createContext, useContext, useState } from 'react';
import * as Automerge from 'automerge';

// Create the context
const AutomergeContext = createContext();

// Custom hook to use the Automerge context
export const useAutomerge = () => useContext(AutomergeContext);

// AutomergeProvider component
export const AutomergeProvider = ({ children }) => {
  // Initialize the Automerge document in state
  const [doc, setDoc] = useState(Automerge.from({ items: [] }));

  return (
    <AutomergeContext.Provider value={{ doc, setDoc }}>
      {children}
    </AutomergeContext.Provider>
  );
};
