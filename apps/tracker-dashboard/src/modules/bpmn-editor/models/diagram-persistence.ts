import {
  type EditorErrorKey,
  editorErrorKeys,
  getDiagramService,
} from './editor-model';

export interface SaveResult {
  ok: boolean;
  error?: EditorErrorKey;
}

/**
 * "Saves" the current diagram by printing its serialised XML to the console.
 *
 * TODO: POST the serialised XML to the BPMN diagram endpoint and await the
 * stored revision. Until that endpoint exists the XML only goes to the console,
 * so the button in the top bar is never dead.
 */
export const saveDiagram = async (): Promise<SaveResult> => {
  const service = getDiagramService();

  if (!service) return { ok: false, error: editorErrorKeys.notReady };

  const { xml, error } = await service.exportXml();

  if (error) {
    console.warn('bpmn-editor: diagram export failed', error);

    return { ok: false, error: editorErrorKeys.exportFailed };
  }

  if (!xml) return { ok: false, error: editorErrorKeys.nothingToSave };

  // eslint-disable-next-line no-console -- stand-in for the pending save endpoint
  console.log(xml);

  return { ok: true };
};
