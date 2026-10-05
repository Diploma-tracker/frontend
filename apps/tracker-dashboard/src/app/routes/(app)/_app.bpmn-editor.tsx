import { BpmnEditorPage } from '@/pages/bpmn-editor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/bpmn-editor')({
  component: BpmnEditorPage,
});
