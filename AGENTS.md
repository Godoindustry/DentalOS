## Goal
- Deliver a fully functional dental clinic management system with correct 3D odontograma, working CRUD flows, and n8n bot integration

## Constraints & Preferences
- Database must support both app tables (`clinica_id UUID FK`) and bot storage tables (`clinic_id TEXT`)
- `schema_clean.sql` is the single source of truth for all 14 tables
- 3D model is purely visual support using single `teeth-base-mesh.glb` — NO clickable boxes, NO per-tooth mapping
- All pages must pass Next.js 16 static generation (Suspense boundaries for `useSearchParams`)

## Progress
### Done
- Added `"debito"` to `forma_pagamento` TypeScript union type
- Rewrote `procedimentos/[id]` to fetch from DB instead of mock data
- Created missing `profissionais/[id]` page (was 404 from Editar link)
- Added `?edit=` support to `pacientes/novo`: pre-fills form for editing
- Added server actions: `editarProcedimento`, `editarProfissional`, `editarPaciente`
- Added single-item hooks: `useProcedimento(id)`, `useProfissional(id)`
- Changed `useConversasRecentes` from `!inner` to left join (prevents losing rows with null `paciente_potencial_id`)
- Wrapped `useSearchParams()` in `<Suspense>` boundary to fix Vercel build error
- Added `getClinicaId()` helper that verifies clinica exists in `clinicas` table — auto-recreates and refreshes session if missing (fixes FK violation on patient create after `schema_clean.sql` reset)
- Replaced `Odontograma3DScene` to render `teeth-base-mesh.glb` (single model from `Teeth_Base_Mesh_Modeling/`) as pure visual support, no interaction
- Removed all 3D clickable boxes, arcada GLBs, and per-tooth mapping — 3D is visual-only; tooth interaction handled by 2D `OdontogramaProfissional`
- Fixed TS compilation errors in dead `odontograma-3d-stl-scene.tsx` (removed custom `useMemo`, fixed `Box3.setFromObject`)

### In Progress
- (none — awaiting user testing)

### Blocked
- (none)

## Key Decisions
- Individual tooth GLB approach abandoned — STL processor produces GLBs without position data
- Arcada models (`arcada-superior.glb` + `arcada-inferior.glb`) also abandoned in favor of `teeth-base-mesh.glb` per user request
- `teeth-base-mesh.glb` (from `Teeth_Base_Mesh_Modeling/`) is the single 3D model — 13 nodes with proper translations, rendered as a single grouped mesh
- 3D viewer is purely decorative/anatomical reference; all tooth interaction (clicking, status changes, coloring) happens on the 2D `OdontogramaProfissional`
- `Odontograma3DScene` now takes zero props
- `@react-three/fiber` + `drei` produce `THREE.Clock.getDelta()` deprecation warnings on three.js r184+ — cosmetic only

## Next Steps
1. User should test the 3D model renders on the paciente page (`/pacientes/[id]`)
2. Run `schema_clean.sql` in Supabase SQL Editor for fresh database
3. Verify n8n integration end-to-end
4. (Optional) Adjust camera position, lighting, or material color in `odontograma-3d-scene.tsx` if the model appearance needs tweaking

## Relevant Files
- `src/components/odontograma/odontograma-3d-scene.tsx`: Single 3D visual model using teeth-base-mesh.glb (WORKING — no props, no interaction)
- `src/components/odontograma/odontograma-profissional-layout.tsx`: Layout component — now passes zero props to Odontograma3DScene
- `src/components/odontograma/odontograma-3d-stl-scene.tsx`: Dead code (individual tooth GLBs — left for reference)
- `src/components/odontograma/odontograma-3d-stl.tsx`: Dead code (wrapper for STL scene — left for reference)
- `public/models/teeth-base-mesh.glb`: Single tooth arch model (working — used by Odontograma3DScene)
- `public/models/arcada-superior.glb`: Old upper arch model (kept on disk, not used)
- `public/models/arcada-inferior.glb`: Old lower arch model (kept on disk, not used)
- `public/models/teeth/`: 27 individual tooth GLBs (kept on disk, not used — no position data)
- `Teeth_Base_Mesh_Modeling/Teeth_Base_Mesh_Modeling.glb`: Source model (identical to teeth-base-mesh.glb)
- `src/app/(dashboard)/procedimentos/[id]/page.tsx`: Edit page for procedures (uses DB, not mock)
- `src/app/(dashboard)/profissionais/[id]/page.tsx`: Edit page for professionals (was missing)
- `src/app/(dashboard)/pacientes/novo/page.tsx`: Patient create/edit with `?edit=` support
- `src/app/(dashboard)/actions.ts`: Server actions including getClinicaId() and CRUD for pacientes/profissionais/procedimentos
- `src/lib/queries/index.ts`: Hooks including useProcedimento, useProfissional, useConversasRecentes
- `src/types/database.ts`: TypeScript interfaces (forma_pagamento includes "debito")
- `supabase/schema_clean.sql`: Full database schema
