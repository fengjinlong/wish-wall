import React from 'react';
import { Wish, Member } from '../types';
import { WishCardExportModal } from './WishCardExportModal';

interface WishKeepsakeScrollModalProps {
  isOpen: boolean;
  wish: Wish;
  members: Member[];
  onClose: () => void;
}

export const WishKeepsakeScrollModal: React.FC<WishKeepsakeScrollModalProps> = ({
  isOpen,
  wish,
  members,
  onClose,
}) => {
  return (
    <WishCardExportModal
      isOpen={isOpen}
      wish={wish}
      members={members}
      onClose={onClose}
    />
  );
};
