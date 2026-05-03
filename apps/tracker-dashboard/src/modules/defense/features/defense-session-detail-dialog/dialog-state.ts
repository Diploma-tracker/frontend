import { atom } from '@reatom/core';

interface DefenseSessionDialogState {
  sessionId: string | null;
  open: boolean;
  isRegistered?: boolean;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export const defenseSessionDialogAtom = atom<DefenseSessionDialogState>(
  {
    sessionId: null,
    open: false,
  },
  'defenseSessionDialogAtom',
);
