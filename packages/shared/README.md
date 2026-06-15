# Shared — ct-appportal

TypeScript-Type-Definitionen für das ct-appportal, die **automatisch aus C# DTOs generiert** werden.

## Konzept

Dieses Package stellt sicher, dass Frontend und Backend die **gleichen Datenstrukturen** verwenden, ohne doppelte Definitionen pflegen zu müssen.

### Workflow

1. **Backend definiert DTOs** in `packages/backend/Models/Dtos/` (C# `record`)
2. **DtoTypeGenerator läuft** und liest C# DTOs via Reflection
3. **TypeScript-Interfaces werden generiert** in `src/generated/dtos.ts`
4. **Frontend importiert Types** aus diesem Package

```typescript
import { AppDto, MeDto, GroupDto } from '@eagles-jungscharen/ct-appportal-shared';
```

## Struktur

```
packages/shared/
├── src/
│   ├── index.ts                 # Package Entry Point (Re-Exports)
│   ├── generated/
│   │   └── dtos.ts              # AUTO-GENERIERT aus C# DTOs
│   └── types/
│       └── custom.ts            # Manuelle Type-Definitionen (optional)
├── package.json
├── tsconfig.json
└── README.md
```

## Verwendung im Frontend

### Installation (bereits via Workspace konfiguriert)

```json
{
  "dependencies": {
    "@eagles-jungscharen/ct-appportal-shared": "workspace:*"
  }
}
```

### Import

```typescript
import { AppDto, MeDto, GroupDto } from '@eagles-jungscharen/ct-appportal-shared';

const app: AppDto = {
  id: '123',
  name: 'Meine App',
  description: 'Beschreibung',
  url: 'https://example.com',
  iconUrl: null,
  redirectUris: [],
  roleIds: [],
};
```

## Type-Generierung

### Generator ausführen

```bash
# Im Monorepo-Root
npm run generate:types
```

Dieser Befehl:
1. Kompiliert das Backend (falls nötig)
2. Führt `DtoTypeGenerator` aus (`packages/backend/Tools/DtoTypeGenerator/`)
3. Schreibt TypeScript-Interfaces nach `src/generated/dtos.ts`

### Automatische Updates

Nach Änderungen an Backend-DTOs:
```bash
npm run generate:types
```

**Wichtig**: `src/generated/dtos.ts` wird komplett überschrieben — niemals manuell editieren!

## Generierte Types

Das Tool konvertiert:
- **C# `record`** → TypeScript `interface`
- **C# Properties** → TypeScript Properties
- **`string?`** → `string | null`
- **`List<T>`, `T[]`** → `T[]`
- **`DateTime`** → `string` (ISO 8601)
- **Enums** → TypeScript `enum`

### Beispiel

**Backend (C#):**
```csharp
public record AppDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public List<string> RedirectUris { get; init; } = [];
}
```

**Frontend (TypeScript, generiert):**
```typescript
export interface AppDto {
  id: string;
  name: string;
  description: string | null;
  redirectUris: string[];
}
```

## Manuelle Types

Falls manuelle Type-Definitionen benötigt werden (z.B. Frontend-spezifische Utility-Types), können diese in `src/types/` abgelegt werden:

```typescript
// src/types/custom.ts
export type AppWithStatus = AppDto & {
  isActive: boolean;
  lastAccessed: Date;
};
```

Anschliessend in `src/index.ts` re-exportieren:
```typescript
export * from './types/custom.js';
```

## Type-Checking

```bash
# Im Shared-Package
npm run type-check

# Oder im Monorepo-Root
npm run lint --workspace=@eagles-jungscharen/ct-appportal-shared
```

## Troubleshooting

### "Cannot find module '@eagles-jungscharen/ct-appportal-shared'"

```bash
# Dependencies neu installieren
npm install
```

### Generated DTOs fehlen

```bash
# Type-Generator ausführen
npm run generate:types
```

### Type-Fehler nach Backend-Änderung

1. Backend DTOs ändern
2. `npm run generate:types` ausführen
3. Frontend neu builden

## Weitere Informationen

- **Generator-Source**: `packages/backend/Tools/DtoTypeGenerator/Program.cs`
- **Backend DTOs**: `packages/backend/Models/Dtos/`
- **Monorepo-Docs**: `../../docs/ARCHITECTURE.md`
