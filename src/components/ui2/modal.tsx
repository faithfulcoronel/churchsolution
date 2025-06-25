import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <Dialog open={isOpen} onOpenChange={() => onClose()}>
    <DialogContent>
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      )}
      {children}
    </DialogContent>
  </Dialog>
);

export { Modal };
