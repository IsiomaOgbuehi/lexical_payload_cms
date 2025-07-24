import React, { useEffect } from 'react';
import '../styles.css'

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
  position?: { top: number; left: number } | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, children, position }) => {
  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen || !position) return null;

  return (
    <div
      className= 'modal_overlay'
      onClick={() => setIsOpen(false)}
    >
      <div style={{top: `${position.top}px`,
        left: `${position.left}px`,}}
        className= 'modal_containter'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
