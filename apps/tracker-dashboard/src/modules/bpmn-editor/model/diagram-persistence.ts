import { exportXml } from './diagram-api';
import { getModeler } from './editor-model';

export interface SaveResult {
  ok: boolean;
  error?: string;
}

/**
 * Triggers a client-side download of the diagram as a `.bpmn` file.
 *
 * Kept separate from {@link saveDiagram} so it stays available as a fallback
 * while the persistence endpoint is still pending.
 */
export const downloadDiagram = (
  xml: string,
  filename = 'diagram.bpmn',
): void => {
  const blob = new Blob([xml], {
    type: 'application/bpmn20-xml;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

/**
 * Persists the current diagram.
 *
 * TODO: POST the serialised XML to the BPMN diagram endpoint and await the
 * stored revision. Until that endpoint exists this falls back to downloading
 * the file, so the button in the top bar is never dead.
 */
export const saveDiagram = async (): Promise<SaveResult> => {
  const modeler = getModeler();

  if (!modeler) return { ok: false, error: 'The editor is not ready yet.' };

  const { xml, error } = await exportXml(modeler);

  if (error || !xml) {
    return { ok: false, error: error ?? 'Nothing to save.' };
  }

  downloadDiagram(xml);

  return { ok: true };
};
