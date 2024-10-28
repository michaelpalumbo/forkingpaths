import { useState, useEffect, useRef } from 'react';

function RNBOManager({ setRNBO }) {
  const isRNBOInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isRNBOInitialized.current) return;

    const loadRNBO = async () => {
      try {
        const RNBOimport = await import('@rnbo/js');
        setRNBO(RNBOimport);
        isRNBOInitialized.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading RNBO:', error);
      }
    };

    if (isLoading) {
      loadRNBO();
    }
  }, [isLoading, setRNBO]);

  return null;
}

export default RNBOManager;
