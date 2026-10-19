import { action, atom } from '@reatom/core';

import {
  type StageAttributes,
  type StageInfo,
  isRelativeDeadline,
  isStageElement,
} from '../definitions/stage-definitions';
import { readStageAttributes } from '../diagram-api';
import {
  getCurrentElement,
  getDiagramService,
  updateCurrent,
} from '../editor-model';

/** Subprocesses flagged as stages, in their persisted order. */
export const stagesAtom = atom<StageInfo[]>([], 'bpmnEditor.stages');

/**
 * Stage subprocesses as `{ id, name }`, in the persisted `stageOrder`. The
 * order is reconciled with the diagram first, so a stage added (or removed)
 * since the last sort is written into the XML too, not just appended.
 */
const readStages = (): StageInfo[] => {
  const service = getDiagramService();
  if (!service) return [];

  const names = new Map(
    service
      .readStageSubProcesses()
      .map((element) => [
        element.id,
        element.businessObject?.name || element.id,
      ]),
  );

  return service.syncStageOrder().map((id) => ({
    id,
    name: names.get(id) ?? id,
  }));
};

/**
 * Re-reads the stage list from the diagram. Called whenever the diagram
 * changes (import, create, remove, rename, undo/redo).
 */
export const refreshStageState = action(() => {
  const service = getDiagramService();

  if (!service) {
    stagesAtom.set([]);
    return;
  }

  stagesAtom.set(readStages());
});

/** Flags (or unflags) the selected subprocess as a stage. */
export const setSelectedIsStage = action((isStage: boolean) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element || element.type !== 'bpmn:SubProcess') return;

  service.writeStageAttributes(element, isStage ? {} : null);
  updateCurrent();
  refreshStageState();
});

/**
 * Persists the selected stage's ISO 8601 deadline — an absolute datetime or a
 * relative duration from the stage's runtime start; `null` clears it. The two
 * shapes are exclusive, so writing one replaces the other.
 */
export const setSelectedStageDeadline = action((deadline: string | null) => {
  const service = getDiagramService();
  const element = getCurrentElement();
  if (!service || !element || !isStageElement(element)) return;

  const relative = deadline !== null && isRelativeDeadline(deadline);
  const next: StageAttributes =
    deadline === null
      ? {}
      : relative
        ? { deadlineDuration: deadline }
        : { deadline };

  const current = readStageAttributes(element) ?? {};
  const unchanged =
    (current.deadline ?? null) === (next.deadline ?? null) &&
    (current.deadlineDuration ?? null) === (next.deadlineDuration ?? null);

  if (unchanged) return;

  service.writeStageAttributes(element, next);
  updateCurrent();
});

/** Persists a new stage order, writing the ids back into the diagram XML. */
export const reorderStages = action((ids: string[]) => {
  const service = getDiagramService();
  if (!service) return;

  service.writeStageOrder(ids);
  stagesAtom.set(readStages());
});
