# Plan: Thesis Process UI Rework

## Scope (from task.md)

1. Keep GET by process UUID (not /my) — revert /my changes
2. FileDTO returns only file_id + version; new /download-file/{file_id} endpoint generates presigned URL; BachelorThesisProcess.check_access() for authorization
3. UI panels: always show relevant data (or "—" if missing); actions via ConfirmationModal or ActionDialog

---

## Part 1 — Revert /my changes

### Backend — delete

- `src/modules/projects/application/queries/get_my_bachelor_thesis_process.py`
- `src/modules/projects/infrastructure/queries/get_my_bachelor_thesis_process_sqlalchemy.py`
- `src/modules/projects/presentation/api/bachelor_thesis_process/get_my_process.py`
- Remove from `queries/__init__.py` and `providers.py` and router `__init__.py`

### Frontend — revert

- `packages/api/src/sdk/bachelor-thesis-process.ts` — remove `getMyBachelorThesisProcess`
- `packages/api/src/generated/bachelor-thesis-process.ts` — remove `getMyBachelorThesisProcess`
- `models/bachelor-thesis-process.ts` — revert to `getBachelorThesisProcessDetails(id)` with guard `if (!id) return NULL_PROCESS`; remove `.set(process.id)` auto-assign
- `pages/thesis-process/thesis-process-page.tsx` — restore hardcoded UUID + `useEffect` setter (TODO comment)

---

## Part 2 — FileDTO: only file_id + version

### Backend

**`application/queries/get_bachelor_thesis_process_details.py`** — change `FileDTO`:

```python
@dataclass
class FileDTO:
    file_id: str
    version: int
```

Remove `file_key` field.

**`infrastructure/queries/get_bachelor_thesis_process_details_sqlalchemy.py`** — update `_file_dto()`:

- No longer reads `.file` / `.versions`; just reads `vf.id` + `vf.current_version`
- Remove `selectinload(...versions)` from the SQLAlchemy query (no longer needed)

### Frontend

**`packages/api/src/generated/model/file-dt-o.ts`** — remove `fileKey`:

```ts
export interface FileDTO {
  fileId: string;
  version: number;
}
```

---

## Part 3 — `generate_download_url` in ObjectStorage

**`seedwork/application/object_storage.py`** — add to Protocol:

```python
async def generate_download_url(self, key: str, bucket: str | None = None) -> str: ...
```

**`seedwork/infrastructure/object_storage.py`** — implement in `S3ObjectStorage`:

```python
async def generate_download_url(self, key: str, bucket: str | None = None) -> str:
    bucket = self._resolve_bucket(bucket)
    async with self._client() as s3:
        url = await s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=self._presigned_url_expires_in,
        )
    return url
```

---

## Part 4 — `check_access` on `BachelorThesisProcess`

**`domain/processes/bachelor_thesis_process/process.py`** — add method:

```python
from src.modules.projects.domain.value_objects.user_role import UserRole

def check_access(self, user: User) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    actor_ids = {uid for uid in self._get_roles().values() if uid is not None}
    return UserId(str(user.id)) in actor_ids
```

---

## Part 5 — `/download-file/{file_id}` endpoint

### Backend: query ABC

**`application/queries/get_file_download_url.py`** (new):

```python
@dataclass
class GetFileDownloadUrlParams:
    process_id: str
    file_id: str
    user: User

@dataclass
class DownloadUrlDTO:
    url: str

class GetFileDownloadUrl(Query[GetFileDownloadUrlParams, DownloadUrlDTO]): ...
```

### Backend: SQLAlchemy impl

**`infrastructure/queries/get_file_download_url_sqlalchemy.py`** (new):

1. Load `BachelorThesisProcessModel` by `process_id`
2. Reconstruct domain object via `to_bachelor_thesis_process(model)`
3. Call `process.check_access(params.user)` — raise `PermissionDeniedException` (403) if false
4. Find `VersionedFileVersionModel` where `file_id = params.file_id` AND `version = current_version`
5. Call `object_storage.generate_download_url(file_key)` → return `DownloadUrlDTO(url=...)`

### Backend: HTTP handler

**`presentation/api/bachelor_thesis_process/download_file.py`** (new):

```python
@get("/{process_id:str}/download-file/{file_id:str}", ...)
async def download_file(...) -> DownloadUrlDTO:
    user = await get_current_user(request, auth_service)
    return await query(GetFileDownloadUrlParams(process_id, file_id, user))
```

### Backend: wire up

- Add to `queries/__init__.py`
- Add provider in `providers.py` (needs `AsyncSession` + `Engine` + `ObjectStorage`)
- Add to router in `presentation/api/__init__.py`

### Frontend: API call

**`packages/api/src/generated/bachelor-thesis-process.ts`** — add:

```ts
export const downloadFile = (processId: string, fileId: string) =>
  orvalCustomInstance<{ url: string }>({
    url: `/projects/bachelor-thesis-process/${processId}/download-file/${fileId}`,
    method: "GET",
  });
```

Re-export from `sdk/bachelor-thesis-process.ts`.

### Frontend: `FileLink` component (in `common.tsx`)

Replace current implementation:

```tsx
// onClick: call downloadFile(processId, fileId) → open url in new tab
export function FileLink({
  processId,
  fileId,
  label,
}: {
  processId: string;
  fileId: string;
  label?: string;
}) {
  const handleClick = async () => {
    const res = await wrap(
      bachelorThesisProcess.downloadFile(processId, fileId),
    );
    if (res.ok) window.open(res.data.url, "_blank");
  };
  return (
    <button onClick={handleClick} className="text-sm text-primary underline">
      {label ?? "Відкрити файл"}
    </button>
  );
}
```

All usages need `processId` passed down — add `processId` prop to all panels that display files.

---

## Part 6 — `ThesisDataDTO`: add `defense_session_id`

Per task.md point 3 — defense_registration panel shows session ID (or "—").  
Currently `ThesisDataDTO` has no `defense_session_id`. Since storing it requires aggregate + ORM + migration changes (out of scope for now), always show "—" for session ID in the panel. **No backend changes needed.**

---

## Part 7 — UI Panels rework

### New layout rule (all panels):

```
[StageDescription — description, responsible, state label — always]
[Data section — all relevant data for this stage — always, "—" if missing]
[Actions section — buttons — only when status === 'active']
```

### New modal components in `common.tsx`

**`ConfirmationModal`** — wraps `AlertDialog`:

```tsx
interface ConfirmationModalProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}
```

**`ActionDialog`** — wraps `Dialog`:

```tsx
interface ActionDialogProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode; // form fields
  submitLabel?: string;
  canSubmit?: boolean;
  loading?: boolean;
  onSubmit: () => Promise<void> | void;
}
```

### Per-panel changes

#### `init_process`

- **Data**: show actors from `actors` prop (student, supervisor + 4 optional roles). Each shown as `DataItem` with role label + userId (resolved via `userQuery` on frontend — display name). If role not yet assigned → "—"
- **Actions** (active only): one button "Призначити ролі" → `ActionDialog` with 4 `UsersSelector`s (plagiarism_supervisor, internship_supervisor, commission_member, reviewer). On submit: `INIT_PROCESS` event.
- **Needs new prop**: `actors: ActorSnapshot[]`

#### `topic_approval`

- **Data**: `data.topic.uk` / `data.topic.en`, or "—" for each
- **Actions** (active):
  - `student_upload_topic`: button "Подати тему" → `ActionDialog` with 2 `TextInputField` → `CHOOSE_TOPIC`
  - `supervisor_review_topic`: "Затвердити" → `ConfirmationModal` → `APPROVE_TOPIC_BY_SUPERVISOR`; "Відхилити" → `ConfirmationModal` → `REJECT_TOPIC_BY_SUPERVISOR`
  - `admin_review_topic`: same pattern with admin events

#### `design`

- **Data**: `data.thesisArchive` → `FileLink` or "—"; `data.thesisReport` → `FileLink` or "—"
- **Actions** (active):
  - `student_upload_thesis`: "Завантажити матеріали" → `ActionDialog` with 2 `FileInputField` → `UPLOAD_THESIS_MATERIALS`
  - `supervisor_review_thesis`: "Затвердити" → `ConfirmationModal`; "Відхилити" → `ConfirmationModal`

#### `internship`

- **Data**: `data.internshipReport` → `FileLink` or "—"
- **Actions** (active):
  - `student_upload_internship_report`: "Завантажити звіт" → `ActionDialog` with `FileInputField` → `UPLOAD_INTERNSHIP_REPORT`
  - `practice_supervisor_review`: "Затвердити" → `ConfirmationModal`; "Відхилити" → `ConfirmationModal`

#### `plagiarism_check`

- **Data**: `data.thesisArchive` → `FileLink` or "—"; `data.thesisReport` → `FileLink` or "—"; `data.plagiarismReport` → `FileLink` or "—"
- **Actions** (active):
  - `plagiarism_supervisor_check`: "Затвердити (з звітом)" → `ActionDialog` with `FileInputField` → `APPROVE_PLAGIARISM_CHECK`; "Відхилити" → `ConfirmationModal` → `REJECT_PLAGIARISM_CHECK`
  - `student_reupload_thesis`: "Повторно завантажити" → `ActionDialog` with 2 `FileInputField` → `FIX_PLAGIARISM_ISSUES`

#### `defense_registration`

- **Data**: session ID → "—" (always, until backend stores it)
- **Actions** (active):
  - `student_register_defense`: "Записатись на захист" → `ActionDialog` з session selector (fetch sessions on open) → `REGISTER_DEFENSE`
  - `registered`: "Скасувати запис" → `ConfirmationModal` → `UNREGISTER_DEFENSE`

#### `pre_defense`

- **Data**: `data.thesisArchive` → `FileLink` or "—"; `data.thesisReport` → `FileLink` or "—"
- **Actions** (active):
  - `commission_review`: "Допустити" → `ConfirmationModal`; "Відхилити" → `ConfirmationModal`
  - `student_reupload_thesis`: "Виправити та надіслати" → `ActionDialog` з 2 `FileInputField` → `FIX_PRE_DEFENSE_ISSUES`

#### `review`

- **Data**: `data.reviewReport` → `FileLink` or "—"
- **Actions** (active):
  - (single state): "Завантажити рецензію" → `ActionDialog` з `FileInputField` → `UPLOAD_REVIEW_REPORT`

#### `thesis_defense`

- **Data**: `data.grade` → число або "—"; `data.gradeLetter` → літера або "—"
- **Actions** (active):
  - (single state): "Виставити оцінку" → `ActionDialog` з number `Input` → `THESIS_DEFENSE`

---

## Execution order

1. Revert `/my` backend files + frontend changes
2. Update `FileDTO` (backend DTO + SQLAlchemy impl)
3. Update frontend `FileDTO` type
4. Add `generate_download_url` to ObjectStorage ABC + S3 impl
5. Add `check_access` to `BachelorThesisProcess`
6. Create `GetFileDownloadUrl` query + SQLAlchemy impl + handler + wire DI + router
7. Add `downloadFile` to frontend API client + SDK
8. Update `FileLink` in `common.tsx` to use `downloadFile`; add `processId` prop to panels with files
9. Add `ConfirmationModal` + `ActionDialog` to `common.tsx`
10. Rewrite all 9 panels with new data+actions structure
11. Update `StageDetailPanel` to pass `actors` to `InitProcessPanel`
12. Run `npx tsc --noEmit` — fix any type errors
