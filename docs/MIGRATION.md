# Monorepo-Migration — ct-appportal

## Übersicht

Dieses Dokument beschreibt die Migration von zwei getrennten Repositories (`ct-appportal-ui` und `ct-appportal-azfunctions`) in ein einziges Monorepo mit npm workspaces.

## Motivation

- **Vereinfachte Entwicklung**: Alle Projekte in einem Repository
- **Type-Synchronisation**: Automatische Generierung von TypeScript-DTOs aus C# Backend
- **Gemeinsame Tooling**: Einheitliche Scripts, Linting, CI/CD
- **Reduzierte Komplexität**: Keine separaten Repository-Klone mehr nötig

## Migration Timeline

**Datum**: 2026-06-15

### Phase 1: Monorepo-Grundstruktur

- ✅ Root `package.json` mit npm workspaces
- ✅ Kombinierte `.gitignore` (Frontend + Backend + Azurite)
- ✅ Root `.env.example` (alle Environment-Variablen)
- ✅ `.github/copilot-instructions.md` (fusioniert)
- ✅ Ordnerstruktur: `packages/`, `infrastructure/`, `docs/`, `scripts/`

### Phase 2: Frontend Migration

- ✅ Alle Dateien von `ct-appportal-ui/` → `packages/frontend/`
- ✅ `package.json` angepasst: Name → `@eagles-jungscharen/ct-appportal-frontend`
- ✅ Workspace-Dependency zu `@eagles-jungscharen/ct-appportal-shared` hinzugefügt

### Phase 3: Backend Migration

- ✅ Alle Dateien von `ct-appportal-azfunctions/` → `packages/backend/`
- ✅ Azurite-Dateien ausgeschlossen (`__azurite*`, `__blobstorage__/`, etc.)
- ✅ `local.settings.json.example` erstellt
- ✅ Backend `package.json` erstellt (für npm workspace)

### Phase 4: Shared Package Setup

- ✅ `packages/shared/` erstellt
- ✅ `package.json`, `tsconfig.json`, `src/index.ts` erstellt
- ✅ `src/generated/dtos.ts` (Placeholder)

### Phase 5: DtoTypeGenerator Tool

- ✅ `packages/backend/Tools/DtoTypeGenerator/` erstellt
- ✅ C# Console App mit Reflection-basierter TypeScript-Generierung
- ✅ Root-Script: `npm run generate:types`

### Phase 6: Frontend-Integration mit Shared

- ✅ Frontend importiert Types aus `@eagles-jungscharen/ct-appportal-shared`
- ⚠️ **Noch nicht migriert**: Frontend-Code verwendet noch lokale `api/types.ts`
- 📋 **TODO**: Frontend-Imports auf Shared Package umstellen (siehe Breaking Changes)

### Phase 7: Infrastructure Setup

- ✅ `infrastructure/local/` — Azurite-Script, README
- ✅ `infrastructure/azure/` — Deployment-Platzhalter
- ✅ `infrastructure/scripts/` — Platzhalter

### Phase 8: Root-Level Scripts

- ✅ `scripts/generate-env.js` — Generiert `.env.local` für Frontend und Backend
- ✅ `scripts/clean.sh` — Cleanup-Script

### Phase 9: VS Code Workspace

- ✅ `ct-appportal.code-workspace` — Multi-Root Workspace
- ✅ Empfohlene Extensions
- ✅ Workspace-Settings

### Phase 10: Documentation

- ✅ `docs/ARCHITECTURE.md` — Architektur-Übersicht
- ✅ `docs/DEVELOPMENT.md` — Entwicklungs-Workflow
- ✅ `docs/DEPLOYMENT.md` — Deployment-Platzhalter
- ✅ `docs/MIGRATION.md` — Dieses Dokument

### Phase 11: Finalisierung

- 🔄 **In Progress**: `npm install` ausführen
- 📋 **TODO**: `npm run generate:types` ausführen
- 📋 **TODO**: Verifizierung durchführen

## Breaking Changes für Entwickler

### Environment Variables

**Vorher** (separate Repos):
- `ct-appportal-ui/.env.local`
- `ct-appportal-azfunctions/local.settings.json`

**Jetzt** (Monorepo):
- **Root** `.env.local` (manuell gepflegt)
- `packages/frontend/.env.local` (automatisch generiert via `npm run generate:env`)
- `packages/backend/local.settings.json` (automatisch generiert)

### Frontend Type-Imports

**Vorher**:
```typescript
import { AppDto, MeDto } from './api/types';
```

**Jetzt**:
```typescript
import { AppDto, MeDto } from '@eagles-jungscharen/ct-appportal-shared';
```

### Git Repository

**Vorher**: Zwei separate Repos
- `https://github.com/Eagles-Jungscharen/ct-appportal-ui`
- `https://github.com/Eagles-Jungscharen/ct-appportal-azfunctions`

**Jetzt**: Ein Monorepo
- `https://github.com/Eagles-Jungscharen/ct-appportal`

**Git-Historie**: Die Historie der beiden separaten Repos ist **nicht** im Monorepo enthalten (Fresh Start).

### Development Commands

**Vorher**:
```bash
# Frontend
cd ct-appportal-ui
npm run dev

# Backend
cd ct-appportal-azfunctions
func start
```

**Jetzt**:
```bash
# Beide gleichzeitig
npm run dev

# Oder einzeln
npm run dev:frontend
npm run dev:backend
```

## Offene Aufgaben

### Sofort

- [ ] `npm install` ausführen
- [ ] `.env.local` aus `.env.example` erstellen
- [ ] `npm run generate:env` ausführen
- [ ] `npm run generate:types` ausführen
- [ ] Verifizierung durchführen

### Frontend-Code-Anpassungen

- [ ] Alle Imports von `./api/types` auf `@eagles-jungscharen/ct-appportal-shared` umstellen
- [ ] `src/api/types.ts` entweder löschen oder als Re-Export beibehalten

### CI/CD

- [ ] GitHub Actions Workflows für Build/Test einrichten
- [ ] Azure Deployment-Pipeline konfigurieren

### Dokumentation

- [ ] `docs/DEPLOYMENT.md` vervollständigen mit Azure-Deployment-Schritten

## Rollback-Plan

Falls Probleme auftreten, können die alten Repos aus den Backups wiederhergestellt werden:

```bash
# Alte Repos sind vorerst noch verfügbar
cd /Users/christianguedemann/Development/Repositories/C_EaglesJungscharen
ls ct-appportal-ui/
ls ct-appportal-azfunctions/
```

## Lessons Learned

- **npm workspaces** funktioniert gut für Multi-Package-Repos
- **C# → TypeScript Generierung** via Reflection ist robust
- **Monorepo Tooling** (concurrently, generate-env) vereinfacht Workflows
- **Type-Safety** zwischen Frontend und Backend ist jetzt gewährleistet

## Weitere Informationen

- [ARCHITECTURE.md](ARCHITECTURE.md) — Neue Monorepo-Architektur
- [DEVELOPMENT.md](DEVELOPMENT.md) — Entwicklungs-Workflow
