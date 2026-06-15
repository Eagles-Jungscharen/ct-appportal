# Lokale Entwicklung — ct-appportal

## Voraussetzungen

Stelle sicher, dass folgende Tools installiert sind:

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **.NET SDK** 10.0
- **Azure Functions Core Tools** v4
- **Azurite** (Azure Storage Emulator)

### Installationsprüfung

```bash
node --version    # Sollte ≥ v20.0.0 sein
npm --version     # Sollte ≥ 10.0.0 sein
dotnet --version  # Sollte ≥ 10.0.0 sein
func --version    # Sollte ≥ 4.0.0 sein
azurite --version # Sollte installiert sein
```

## Ersteinrichtung

### 1. Repository klonen

```bash
git clone https://github.com/Eagles-Jungscharen/ct-appportal.git
cd ct-appportal
```

### 2. Dependencies installieren

```bash
npm install
```

Dies installiert Dependencies für **alle Packages** (Frontend, Backend, Shared).

### 3. Environment-Konfiguration

Erstelle `.env.local` aus der Vorlage:

```bash
cp .env.example .env.local
```

Bearbeite `.env.local` und trage deine Werte ein:

```env
# Churchtool IDP
VITE_OIDC_AUTHORITY=https://your-churchtool-idp.example.com
VITE_OIDC_CLIENT_ID=your-client-id

# Backend-Konfiguration
CHURCHTOOL_IDP_BASE_URL=https://your-churchtool-idp.example.com
CHURCHTOOL_IDP_FUNCTION_KEY=your-function-key
CHURCHTOOL_URL=https://your-org.church.tools
CHURCHTOOL_ADMIN_GROUP_ID=6

# ... weitere Variablen
```

Generiere Package-spezifische Environment-Dateien:

```bash
npm run generate:env
```

Dies erstellt:
- `packages/frontend/.env.local` (mit `VITE_*` Variablen)
- `packages/backend/local.settings.json` (mit Backend-Konfiguration)

### 4. TypeScript-DTOs generieren

```bash
npm run generate:types
```

Dies generiert TypeScript-Interfaces aus C# DTOs.

### 5. Azurite starten

In einem **separaten Terminal**:

```bash
# Option 1: Direkt via azurite
azurite --silent --location ./azurite --debug ./azurite/debug.log

# Option 2: Via Script
sh infrastructure/local/azurite-start.sh
```

Azurite läuft auf:
- Blob: http://127.0.0.1:10000
- Queue: http://127.0.0.1:10001
- Table: http://127.0.0.1:10002

## Development Starten

### Alle Services starten (Frontend + Backend)

```bash
npm run dev
```

Dies startet **gleichzeitig**:
- **Frontend** auf http://localhost:5173
- **Backend** auf http://localhost:7071

### Einzelne Services starten

```bash
# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend
```

## Entwicklungs-Workflow

### 1. Backend-DTOs ändern

Wenn du DTOs im Backend änderst (`packages/backend/Models/Dtos/*.cs`):

```bash
# Types neu generieren
npm run generate:types

# Frontend neu starten (falls bereits gestartet)
```

### 2. Environment-Variablen ändern

Nach Änderungen an `.env.local`:

```bash
npm run generate:env
```

Dann Services neu starten.

### 3. Frontend-Code-Änderungen

Vite unterstützt **Hot Module Replacement (HMR)** — Änderungen werden sofort sichtbar.

### 4. Backend-Code-Änderungen

Azure Functions Core Tools überwacht Änderungen automatisch und kompiliert neu.

## Nützliche Commands

### Build

```bash
# Alle Packages bauen
npm run build

# Nur Frontend bauen
npm run build:frontend

# Nur Backend bauen
npm run build:backend
```

### Linting

```bash
# Alle Packages linten
npm run lint
```

### Cleanup

```bash
# Alle Build-Artefakte und Dependencies löschen
npm run clean

# Dependencies neu installieren
npm install
```

## Debugging

### Frontend (VS Code)

Öffne `ct-appportal.code-workspace` und nutze die vorkonfigurierte Launch-Configuration:

1. Setze Breakpoints in TypeScript/TSX-Dateien
2. Drücke `F5` oder wähle "Debug: Chrome" aus der Debug-Leiste
3. Browser öffnet sich und pausiert an Breakpoints

### Backend (VS Code)

1. Setze Breakpoints in C#-Dateien
2. Starte Backend im Debug-Modus: `F5` oder wähle "Attach to .NET Functions"
3. Backend pausiert an Breakpoints

### Browser DevTools

- **Frontend**: Browser DevTools (`F12` in Chrome/Edge)
- **Network Tab**: API-Requests überwachen
- **Console**: React-Fehler und Logs

## Troubleshooting

### Frontend kann Backend nicht erreichen

**Problem**: API-Requests schlagen fehl mit `ERR_CONNECTION_REFUSED`

**Lösung**:
1. Prüfe, ob Backend läuft: http://localhost:7071
2. Prüfe `VITE_API_BASE_URL` in `packages/frontend/.env.local`
3. Prüfe Vite-Proxy in `packages/frontend/vite.config.ts`

### Azurite Connection Failed

**Problem**: Backend kann nicht auf Table Storage zugreifen

**Lösung**:
1. Stelle sicher, dass Azurite läuft
2. Prüfe `AzureWebJobsStorage` in `packages/backend/local.settings.json`
3. Lösche Azurite-Datenbanken und starte neu:
   ```bash
   rm -rf azurite __azurite*
   azurite --silent --location ./azurite
   ```

### OIDC Authentication Failed

**Problem**: Login schlägt fehl oder leitet nicht korrekt weiter

**Lösung**:
1. Prüfe `VITE_OIDC_AUTHORITY` und `VITE_OIDC_CLIENT_ID` in `.env.local`
2. Stelle sicher, dass die Redirect-URI im ChurchTool IDP registriert ist:
   ```
   http://localhost:5173/auth/callback
   ```

### Type-Fehler nach Backend-Änderung

**Problem**: Frontend zeigt TypeScript-Fehler für Backend-DTOs

**Lösung**:
```bash
npm run generate:types
```

### Port bereits belegt

**Problem**: Port 5173 oder 7071 ist bereits in Verwendung

**Lösung**:
```bash
# Finde Prozess auf Port
lsof -i :5173
lsof -i :7071

# Beende Prozess
kill <PID>
```

## Weitere Informationen

- [ARCHITECTURE.md](ARCHITECTURE.md) — Architektur-Übersicht
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment-Anleitung
