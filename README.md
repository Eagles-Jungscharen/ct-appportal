# ct-appportal

Portal für Applikationen die einer Organisation zur Verfügung gestellt werden. Nutzt den churchtool-idp für das Login.

## 📁 Monorepo-Struktur

Dieses Projekt ist als **Monorepo** mit [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) organisiert:

```
ct-appportal/
├── packages/
│   ├── frontend/          # React + Vite Frontend (TypeScript)
│   ├── backend/           # Azure Functions Backend (.NET 10)
│   └── shared/            # Gemeinsame TypeScript-Types (generiert aus C# DTOs)
├── infrastructure/        # Deployment-Konfigurationen und lokale Tools
├── docs/                  # Ausführliche Dokumentation
└── scripts/               # Build- und Setup-Scripts
```

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **.NET SDK** 10.0
- **Azure Functions Core Tools** v4
- **Azurite** (Storage Emulator für lokale Entwicklung)

### Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/Eagles-Jungscharen/ct-appportal.git
   cd ct-appportal
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Environment-Konfiguration erstellen:**
   ```bash
   # .env.local aus .env.example kopieren und Werte anpassen
   cp .env.example .env.local
   
   # Environment-Dateien für Frontend und Backend generieren
   npm run generate:env
   ```

4. **TypeScript-DTOs generieren:**
   ```bash
   npm run generate:types
   ```

5. **Azurite starten** (in separatem Terminal):
   ```bash
   azurite --silent --location ./azurite --debug ./azurite/debug.log
   ```

6. **Frontend und Backend starten:**
   ```bash
   npm run dev
   ```
   
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:7071

## 📦 Packages

### Frontend (`packages/frontend/`)

React 19 + Vite 8 Anwendung mit:
- **UI-Framework**: FluentUI v9
- **Routing**: React Router v7
- **State Management**: TanStack Query v5
- **Authentication**: react-oidc-context

**Entwicklung:**
```bash
npm run dev:frontend
```

### Backend (`packages/backend/`)

.NET 10 Azure Functions (Isolated Worker) mit:
- **Authentication**: JWT-Validierung via `EaglesJungscharen.Azure.ChurchToolIDPServices`
- **Storage**: Azure Table Storage via `GuedesPlace.AzureTools`
- **ChurchTool Integration**: Kiota-generierter Client (`Fegmm.ChurchTools`)

**Entwicklung:**
```bash
npm run dev:backend
```

### Shared (`packages/shared/`)

TypeScript-Typdefinitionen, die **automatisch aus C# DTOs generiert** werden:
```bash
npm run generate:types
```

## 🔧 Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet Frontend und Backend gleichzeitig |
| `npm run dev:frontend` | Startet nur das Frontend (Port 5173) |
| `npm run dev:backend` | Startet nur das Backend (Port 7071) |
| `npm run build` | Baut alle Packages |
| `npm run lint` | Führt ESLint auf allen Packages aus |
| `npm run generate:types` | Generiert TypeScript-DTOs aus C# Models |
| `npm run generate:env` | Erzeugt `.env`-Dateien für Frontend/Backend aus Root `.env.local` |
| `npm run clean` | Löscht alle Build-Artefakte und Dependencies |

## 📚 Dokumentation

Ausführliche Dokumentation finden Sie im [`docs/`](docs/) Ordner:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Monorepo-Architektur und Tech-Stack
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Entwicklungsumgebung und Workflows
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Azure-Deployment-Anleitung
- **[MIGRATION.md](docs/MIGRATION.md)** — Monorepo-Migrationshistorie

## 🔐 Environment Variables

Die Konfiguration erfolgt über eine **zentrale** `.env.local`-Datei im Root-Verzeichnis. Das `generate:env`-Script erzeugt daraus automatisch:
- `packages/frontend/.env.local` (mit `VITE_*`-Variablen)
- `packages/backend/local.settings.json` (mit Backend-Konfiguration)

Siehe [`.env.example`](.env.example) für alle verfügbaren Variablen.

## 🧪 Type-Synchronisation

Dieser Monorepo nutzt **C# als Source of Truth** für Datenmodelle:

1. DTOs werden im Backend definiert: `packages/backend/Models/Dtos/`
2. Das Tool `DtoTypeGenerator` liest diese via Reflection aus
3. TypeScript-Interfaces werden automatisch generiert: `packages/shared/src/generated/dtos.ts`
4. Das Frontend importiert diese: `import { AppDto } from '@eagles-jungscharen/ct-appportal-shared'`

**Generator ausführen:**
```bash
npm run generate:types
```

## 🤝 Beitragen

1. Branch erstellen: `git checkout -b feature/meine-änderung`
2. Änderungen commiten: `git commit -m "feat: Neue Funktion hinzugefügt"`
3. Branch pushen: `git push origin feature/meine-änderung`
4. Pull Request erstellen

## 📄 Lizenz

Apache License 2.0 — siehe [LICENSE](LICENSE) für Details.

## 🔗 Verwandte Projekte

- [churchtool-idp](https://github.com/Eagles-Jungscharen/churchtool-idp) — ChurchTool IDP Backend
- [ct-billingtool](https://github.com/Eagles-Jungscharen/ct-billingtool) — Rechnungstool (ähnliche Monorepo-Struktur)
