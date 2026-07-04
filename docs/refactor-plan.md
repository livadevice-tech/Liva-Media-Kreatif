# Refactor Plan

> Gunakan [`docs/coding-standard.md`](./coding-standard.md) sebagai aturan utama untuk semua perubahan kode.

## Current Safe Direction

The current codebase is already moving in the right direction:
- `App.tsx` is shrinking
- reporting UI is being split into focused components
- shared utilities are being extracted with tests
- the central API client now has explicit contracts for the main domain models
- `LiveReportPanel.tsx` and `EngagementReportPanel.tsx` are now isolated from `App.tsx`

## Folder Plan

### Priority Order
Work these in order to keep behavior stable:
1. Remove dead code and duplicate parser branches from `App.tsx`.
2. Tighten the upload and API boundaries with explicit types.
3. Keep extracting pure helpers into `src/shared/utils/`.
4. Move larger orchestration into feature folders only after the shared helpers are stable.
5. Use [`docs/coding-standard.md`](./coding-standard.md) as the acceptance rule for each slice.

### `src/components/reporting/`
Use this for reporting-specific UI only.
- `ReportFiltersBar.tsx`
- `ReportPeriodNavigator.tsx`
- `ReportMetricCard.tsx`
- `ReportRawSessionsCard.tsx`
- `ReportRawSessionsTable.tsx`
- `ReportRawTableControls.tsx`
- `ReportEngagementUploadHistory.tsx`
- `EngagementReportPanel.tsx`
- `LiveReportPanel.tsx`
- `UploadHistoryCard.tsx`
- `SkuUploadHistoryCard.tsx`
- `LeadPipelinePanel.tsx`
- `LeadFormModal.tsx`
- `SettingsMetadataPanels.tsx`
- `AdminPasswordCard.tsx`
- `AdminMaintenancePanel.tsx`
- `CopilotPanel.tsx`

### `src/shared/utils/`
Use this for pure helpers with no React state.
- `currency.ts`
- `date.ts`
- `dateTime.ts`
- `dateFormatting.ts`
- `calendar.ts`
- `appUi.ts`
- `reportTable.ts`
- `reportDateFilters.ts`
- `copilotFallback.ts`
- `dataBackup.ts`
- `mappingUpload.ts`
- `liveReporting.ts`

### `src/components/admin/`
Use this for admin-only panels and controls if they grow further.
- access management
- quota or maintenance actions
- admin diagnostics

### `src/features/reporting/` as a future target
If reporting grows again, move heavier orchestration here:
- hooks
- types
- services
- parser/adapters
- selectors

### Ideal Final Shape
This is the target layout we should drift toward:
- `src/app/` for application shell and route-level orchestration
- `src/features/reporting/` for reporting state, parsers, and domain hooks
- `src/components/` for reusable UI pieces only
- `src/shared/` for pure utilities, auth, config, and type contracts
- `server/` for backend auth, validation, database helpers, and route logic

## Next Safe Slice

1. Keep peeling remaining product-report orchestration out of `App.tsx`.
2. Move more calculation-heavy reporting logic into pure helpers under `src/shared/utils/` with tests.
3. Start carving `src/features/reporting/` once the remaining reporting UI slices stop changing shape.
4. Revisit `server.ts` after the app-side slices stabilize.
