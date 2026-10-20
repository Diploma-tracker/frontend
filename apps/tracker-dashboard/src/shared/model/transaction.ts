import { type Atom, atom } from '@reatom/core';

export type TransactionalAtom<T> = Atom<T> & {
  commit: () => void;
  rollback: () => void;
};

/**
 * Creates a transactional copy of `src`. The copy starts at `src()`'s value;
 * `commit` pushes the source's current value into the copy, `rollback` pushes
 * the copy's value back into the source.
 */
export function createAtomWithCommit<T>(src: Atom<T>): TransactionalAtom<T> {
  return atom<T>(src()).extend((target) => ({
    commit: () => target.set(src()),
    rollback: () => src.set(target()),
  }));
}

/**
 * Wraps several source atoms into transactional copies and returns them
 * together with a shared `commit` / `rollback` that applies to all of them at
 * once.
 */
export function createAtomsWithCommit<const A extends readonly Atom<unknown>[]>(
  ...srcAtoms: A
): [{ [K in keyof A]: A[K] }, () => void, () => void] {
  const atoms = srcAtoms.map((src) => createAtomWithCommit(src));

  const commit = () => {
    for (const resultAtom of atoms) {
      resultAtom.commit();
    }
  };

  const rollback = () => {
    for (const resultAtom of atoms) {
      resultAtom.rollback();
    }
  };

  return [atoms as { [K in keyof A]: A[K] }, commit, rollback];
}
