import { DeclarativeForm } from '@/shared/components/json-forms';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';

const schema = {
  type: 'object',
  properties: {
    document: {
      type: 'string',
      'x-file-types': ['pdf'],
    },
  },
  required: ['document'],
};

const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/document',
      label: 'Document',
      options: { file: true },
    },
  ],
};

it('accepts file selection, displays the file and allowed types, and validates drops', async () => {
  const user = userEvent.setup();
  render(<DeclarativeForm schema={schema} uischema={uischema} />);

  expect(screen.getByText('Accepted file types: pdf')).toBeVisible();

  const input = screen.getByLabelText('Document');
  const pdf = new File(['pdf contents'], 'thesis.pdf', {
    type: 'application/pdf',
  });
  await user.upload(input, pdf);

  expect(screen.getByText('thesis.pdf')).toBeVisible();
  const invalidFile = new File(['text contents'], 'notes.txt', {
    type: 'text/plain',
  });
  const dropTarget = screen.getByRole('button', { name: 'thesis.pdf' });
  const dropArea = dropTarget.parentElement;
  expect(dropArea).not.toBeNull();
  fireEvent.dragEnter(dropTarget, {
    dataTransfer: { files: [invalidFile] },
  });
  expect(dropArea).toHaveClass('border-destructive');
  fireEvent.dragEnter(dropTarget, {
    dataTransfer: {
      files: [],
      items: [{ kind: 'file', type: 'text/plain', getAsFile: () => null }],
    },
  });
  expect(dropArea).toHaveClass('border-destructive');
  fireEvent.drop(dropTarget, {
    dataTransfer: { files: [invalidFile] },
  });

  expect(screen.getByText('thesis.pdf')).toBeVisible();
  expect(
    screen.getByText('This file type is not allowed. Accepted types: pdf'),
  ).toBeVisible();
});
