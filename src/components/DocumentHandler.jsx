import React from 'react';
import useAutomergeStore from './utility/automergeStore';

function DocumentHandler() {
  const doc = useAutomergeStore((state) => state.doc);
  const handle = useAutomergeStore((state) => state.handle);

  const increment = () => {
    handle.change((d) => {
      d.count += 1;
    });
  };

  return (
    <div>
      <p>Count: {doc?.count || 0}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default DocumentHandler;
