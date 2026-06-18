import React, { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const AuthModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // Bonus: Close the modal if the user presses the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        // 1. PERFECT CENTERING: "fixed inset-0" covers the whole screen, "flex items-center justify-center" centers the content vertically and horizontally.
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">

          {/* 2. CLICK OUTSIDE TO CLOSE: The background overlay. Clicking this triggers onClose(). */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 3. MODAL CONTENT: Positioned relatively to sit above the absolute backdrop. */}
          <motion.div
            className="relative z-10 w-full max-w-5xl mx-auto cursor-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            // Prevents clicks inside the card from bubbling up to the background overlay
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;