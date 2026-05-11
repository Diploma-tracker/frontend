import axios from 'axios';

import type { PendingOperationInitializationDTO } from '../generated/model';
import type { FileField } from '../generated/model/file-field';
import type { ApiResponse } from '../api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Replace every FileField leaf in T with File */
type WithFiles<T> = T extends FileField
  ? File
  : T extends object
    ? { [K in keyof T]: WithFiles<T[K]> }
    : T;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Walk the input payload, collect every key whose value is a File, and build
 * the DTO that the backend expects (replacing File → FileField placeholder).
 *
 * The backend uses the camelCase field name as the upload-url map key, so we
 * use the same key we found on the object.
 */
function extractFiles(input: Record<string, unknown>): {
  dto: Record<string, unknown>;
  files: Map<string, File>;
} {
  const files = new Map<string, File>();

  function walk(obj: unknown, key?: string): unknown {
    if (obj instanceof File) {
      // FileField placeholder – the real uuid will be assigned by the backend;
      // we just need a non-null object here so the schema is satisfied.
      files.set(key!, obj);
      return { fileUuid: '' } satisfies FileField;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, i) => walk(item, `${key}[${i}]`));
    }

    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        result[k] = walk(v, k);
      }
      return result;
    }

    return obj;
  }

  const dto = walk(input) as Record<string, unknown>;
  return { dto, files };
}

/** Upload a single file to a presigned S3 URL using a plain PUT (no auth). */
async function uploadToPresignedUrl(url: string, file: File): Promise<void> {
  await axios.put(url, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * High-level wrapper around the two-step init/commit flow wrapper.
 *
 * Usage:
 * ```ts
 * const someOperation = wrapPostWithFiles(someOperationInit, someOperationCommit);
 * ```
 *
 * Steps:
 * 1. Call Init – send payload with FileField placeholders.
 * 2. Upload each File to the presigned S3 URL returned under `uploadUrls[fieldName]`.
 * 3. Call Commit – notify the backend that all uploads are done.
 */
export function wrapPostWithFiles<
  TInput extends Record<string, unknown>,
  TResponse,
>(
  initFn: (
    dto: TInput,
  ) => Promise<ApiResponse<PendingOperationInitializationDTO>>,
  commitFn: (operationId: string) => Promise<ApiResponse<TResponse>>,
) {
  return async (input: WithFiles<TInput>): Promise<TResponse> => {
    const { dto, files } = extractFiles(
      input as unknown as Record<string, unknown>,
    );

    // 1. Init
    const initResponse = await initFn(dto as unknown as TInput);
    if (!initResponse.ok) {
      throw initResponse.error;
    }

    const { id: operationId, uploadUrls } = initResponse.data;

    // 2. Upload files in parallel
    const uploads = Array.from(files.entries()).map(([fieldName, file]) => {
      const url = uploadUrls[fieldName];
      if (!url) {
        throw new Error(
          `No presigned upload URL returned for field "${fieldName}"`,
        );
      }
      return uploadToPresignedUrl(url, file);
    });

    await Promise.all(uploads);

    // 3. Commit
    const commitResponse = await commitFn(operationId);

    if (!commitResponse.ok) {
      throw commitResponse.error;
    }

    return commitResponse.data;
  };
}
