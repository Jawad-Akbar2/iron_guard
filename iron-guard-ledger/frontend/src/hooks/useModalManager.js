import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore.js';

export const useModalManager = (modalName) => {
  const { closeModal } = useUIStore();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        closeModal(modalName);
      }
    };

    // Add listener
    document.addEventListener('keydown', handleEscKey);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [modalName, closeModal]);

  return { closeModal };
};