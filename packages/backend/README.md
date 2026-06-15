# Backend — ct-appportal

.NET 10 Azure Functions (Isolated Worker) Backend für das ct-appportal. Stellt die REST-API bereit, über die das React-Frontend Applikationen, Benutzerinformationen und OAuth2-Client-Registrierungen verwaltet.

## Tech-Stack

- **.NET 10** (Isolated Worker)
- **Azure Functions v4**
- **ASP.NET Core** Integration (`Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`)
- **Azure Table Storage** via `GuedesPlace.AzureTools` v1.2.2
- **ChurchTool IDP Middleware** via `EaglesJungscharen.Azure.ChurchToolIDPServices` v1.0.0
- **ChurchTools Client** via `Fegmm.ChurchTools` v1.0.11 (Kiota-generiert)

## Entwicklung

### Voraussetzungen

- .NET SDK 10.0
- Azure Functions Core Tools v4
- Azurite (Storage Emulator)

### Lokale Entwicklung starten

```bash
# Im Monorepo-Root
npm run dev:backend

# Oder direkt im Backend-Package
cd packages/backend
func start
```

Das Backend läuft auf: http://localhost:7071

### Azurite starten

```bash
# In separatem Terminal
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

Oder nutze das Script aus `infrastructure/local/`:
```bash
sh infrastructure/local/azurite-start.sh
```

## Projektstruktur

```
packages/backend/
├── Functions/              # Azure Functions Endpoints
│   ├── MeFunction.cs       # GET /api/me
│   ├── AppsFunction.cs     # GET /api/apps
│   └── AppManagementFunction.cs  # /api/appmanagement/*
├── Services/              # Business-Logik (Interfaces + Implementierungen)
│   ├── IAppService.cs / AppService.cs
│   ├── IMeService.cs / MeService.cs
│   ├── IGroupService.cs / GroupService.cs
│   ├── IChurchtoolIdpService.cs / ChurchtoolIdpService.cs
│   └── IIconService.cs / IconService.cs
├── Models/
│   ├── Dtos/             # Response DTOs (record, camelCase JSON)
│   ├── Entities/         # Table Storage Entity-Klassen (class)
│   └── Requests/         # Eingehende Request Bodies (record)
├── Tools/
│   └── DtoTypeGenerator/  # C# → TypeScript DTO-Generator
├── Properties/
│   └── launchSettings.json
├── Program.cs            # DI-Container & Middleware-Setup
├── host.json             # Azure Functions Host-Konfiguration
└── *.csproj              # Projekt-Datei
```

## Konfiguration

Die Konfiguration erfolgt über `local.settings.json` (wird automatisch via Root-Script aus Root `.env.local` generiert).

### Environment Variables

```json
{
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "OIDC_AUTHORITY_URL": "https://your-churchtool-idp.example.com/api/oidc",
    "CHURCHTOOL_IDP_BASE_URL": "https://your-churchtool-idp.example.com",
    "CHURCHTOOL_IDP_FUNCTION_KEY": "your-function-key",
    "CHURCHTOOL_URL": "https://your-org.church.tools",
    "CHURCHTOOL_ADMIN_GROUP_ID": "6",
    "CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING": "..."
  },
  "Host": {
    "CORS": "http://localhost:5173",
    "CORSCredentials": true
  }
}
```

**Wichtig**: `local.settings.json` wird automatisch generiert via:
```bash
npm run generate:env  # Im Monorepo-Root ausführen
```

### Table Storage Tables

Das Backend nutzt folgende Tables (automatisch von Azure Functions erstellt):
- **Apps**: Registrierte Applikationen
- **AppAssignments**: Zuweisungen von Apps zu Gruppen

## API-Endpunkte

Alle Endpunkte benötigen **Bearer Token** (JWT aus Churchtool IDP).

| Methode | Route | Beschreibung | Nur Admin |
|---|---|---|---|
| GET | `/api/me` | Eingeloggter Benutzer (`MeDto`) | — |
| GET | `/api/apps` | Apps des Benutzers (nach Gruppen gefiltert) | — |
| GET | `/api/appmanagement/apps` | Alle registrierten Apps | ✓ |
| POST | `/api/appmanagement/apps` | App erstellen | ✓ |
| PUT | `/api/appmanagement/apps/{id}` | App bearbeiten | ✓ |
| DELETE | `/api/appmanagement/apps/{id}` | App löschen | ✓ |
| POST | `/api/appmanagement/apps/{id}/assignments` | Benutzer/Gruppen zuweisen | ✓ |
| POST | `/api/appmanagement/clients` | OAuth2-Client beim Churchtool IDP registrieren | ✓ |

## Authentication

### JWT-Validierung

Alle Endpunkte verwenden die Middleware aus `EaglesJungscharen.Azure.ChurchToolIDPServices`:
- Bearer Token wird gegen Churchtool IDP validiert (OIDC)
- Token-Claims: `sub` (userId), `name` (displayName)
- `isAdmin` und `groups` werden **separat** aus Churchtool API geladen (nicht aus JWT)

**Wichtig**: Admin-Checks niemals aus JWT-Claims ableiten!

## Datenzugriff

### Table Storage

Zugriff ausschliesslich über `TypedAzureTableClient<T>` aus `GuedesPlace.AzureTools`:

```csharp
// Lesen
var result = await tableClient.GetByIdAsync(id);

// Upsert
await tableClient.InsertOrReplaceAsync(rowKey: entity.Id, partitionKey: "App", entity);

// Löschen
await tableClient.DeleteEntityAsync(rowKey: id, partitionKey: "App");
```

### ChurchTool API

Integration via Kiota-generierter Client (`Fegmm.ChurchTools`):
```csharp
var client = await _clientFactory.CreateClientAsync(userId);
var groups = await client.Groups.GetAsync();
```

## Error Handling

Alle Fehler werden im standardisierten Format zurückgegeben:

```json
{
  "error": "Die Applikation wurde nicht gefunden.",
  "errorNumber": 1101
}
```

### Error-Nummern-Konvention

| Bereich | Nummernbereich |
|---|---|
| Allgemein / Validierung | 1000–1099 |
| Applikations-Management | 1100–1199 |
| Zuweisungen | 1200–1299 |
| IDP / Client-Registrierung | 1300–1399 |

## DTO-Type-Generator

Das Backend enthält ein Tool, um TypeScript-Interfaces aus C# DTOs zu generieren:

```bash
# Im Monorepo-Root
npm run generate:types

# Oder direkt
cd packages/backend/Tools/DtoTypeGenerator
dotnet run ../../../shared/src/generated/dtos.ts
```

Alle `record`-Klassen aus `Models/Dtos/` werden automatisch in TypeScript-Interfaces konvertiert.

## Build & Deploy

### Development Build

```bash
dotnet build
```

### Release Build

```bash
dotnet publish --configuration Release
```

### Azure Deployment

Siehe `../../docs/DEPLOYMENT.md` für Deployment-Anleitung.

## Coding-Konventionen

- **Code**: Englisch (Klassen, Methoden, Variablen)
- **Kommentare**: Deutsch (inline-Kommentare)
- **Fehlermeldungen**: Deutsch (User-facing)
- **DTOs**: `record` (camelCase JSON)
- **Entities**: `class` (Table Storage POCOs)
- **Requests**: `record` (Eingehende Bodies)
- **Services**: Interface + Implementierung, DI-injiziert
- **Keine Business-Logik in Functions** — nur HTTP-Binding & Service-Delegation

## Troubleshooting

### Azurite Connection Failed

- Stelle sicher, dass Azurite läuft: `azurite --silent`
- Prüfe `AzureWebJobsStorage` in `local.settings.json`

### JWT Validation Failed

- Prüfe `OIDC_AUTHORITY_URL` in `local.settings.json`
- Stelle sicher, dass der Bearer Token gültig ist

### Table Storage Table Not Found

- Tabellen werden automatisch erstellt beim ersten Zugriff
- Prüfe Azurite-Logs: `azurite/debug.log`

## Weitere Informationen

Siehe Monorepo-Root-Dokumentation:
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [DEVELOPMENT.md](../../docs/DEVELOPMENT.md)
- [DEPLOYMENT.md](../../docs/DEPLOYMENT.md)
