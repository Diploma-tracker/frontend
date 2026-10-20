import { createAjv } from '@jsonforms/core';

type SharedAjv = ReturnType<typeof createAjv>;

/**
 * Map of common MIME types to file extensions — frontend equivalent of
 * Python's `mimetypes.guess_type` for the subset of types the backend
 * supports in `x-file-types`.
 *
 * @see backend `ProjectFieldSchemaValidator` in `project_data_fields.py`.
 */
const MIME_TO_EXTENSIONS: Record<string, readonly string[]> = {
  'application/json': ['.json'],
  'application/pdf': ['.pdf'],
  'application/xml': ['.xml'],
  'application/zip': ['.zip'],
  'image/bmp': ['.bmp'],
  'image/gif': ['.gif'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
  'text/csv': ['.csv'],
  'text/html': ['.html', '.htm'],
  'text/plain': ['.txt'],
};

const matchesFileTypes = (
  acceptableTypes: readonly string[],
  filename: string,
): boolean => {
  const suffix = filename.includes('.')
    ? `.${filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()}`
    : '';

  const normalized = acceptableTypes.map((t) => t.trim().toLowerCase());

  const extensionTypes = normalized
    .filter((t) => !t.includes('/'))
    .map((t) => (t.startsWith('.') ? t : `.${t}`));

  if (extensionTypes.includes(suffix)) {
    return true;
  }

  for (const mime of normalized) {
    if (!mime.includes('/')) continue;
    const extensions = MIME_TO_EXTENSIONS[mime];
    if (extensions && extensions.includes(suffix)) {
      return true;
    }
  }

  return false;
};

/**
 * Creates an AJV instance with the custom `x-*` keywords registered.
 *
 * Pass this to the `ajv` prop of `<JsonForms>` so that schemas carrying custom
 * keywords validate identically to the backend's `ProjectFieldSchemaValidator`.
 *
 * Keywords use `compile` (not `validate`) so each schema instance gets its own
 * closure with access to the schema value — required for custom error messages
 * that interpolate the acceptable types list.
 *
 * @see backend `project_data_fields.py` — `ProjectFieldSchemaValidator`.
 */
export const createCustomAjv = (): SharedAjv => {
  const ajv = createAjv();

  ajv.addKeyword({
    keyword: 'x-file-types',
    type: 'string',
    errors: true,
    compile(acceptableTypes) {
      if (!Array.isArray(acceptableTypes)) {
        return () => true;
      }
      const types: readonly string[] = acceptableTypes;
      return function validateFileTypes(data: unknown): boolean {
        if (typeof data !== 'string' || matchesFileTypes(types, data)) {
          return true;
        }
        (validateFileTypes as { errors?: unknown[] }).errors = [
          {
            keyword: 'x-file-types',
            message: `File type must be one of: ${types.join(', ')}`,
            params: { types },
          },
        ];
        return false;
      };
    },
  });

  ajv.addKeyword({
    keyword: 'x-property-bounds',
    errors: true,
    compile(keys) {
      if (
        keys == null ||
        typeof keys !== 'object' ||
        !('min' in keys) ||
        !('max' in keys)
      ) {
        return () => true;
      }
      const { min, max } = keys as { min: string; max: string };
      return function validatePropertyBounds(data: unknown): boolean {
        if (typeof data !== 'object' || data === null) {
          return true;
        }
        const record = data as Record<string, unknown>;
        const low = record[min];
        const high = record[max];
        if (typeof low !== 'number' || typeof high !== 'number') {
          return true;
        }
        if (low <= high) {
          return true;
        }
        (validatePropertyBounds as { errors?: unknown[] }).errors = [
          {
            keyword: 'x-property-bounds',
            message: `${min} cannot be greater than ${max}`,
            params: { min, max },
          },
        ];
        return false;
      };
    },
  });

  return ajv;
};
