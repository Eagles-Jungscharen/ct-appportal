# GitHub Copilot Instructions — ct-appportal Monorepo

## Projektübersicht

Monorepo für das ct-appportal: React-Frontend und .NET 10 Azure Functions Backend in einem npm-workspace-basierten Repository. Das Portal verwaltet Applikationen einer Organisation und nutzt den churchtool-idp für Authentication.

### Packages

| Package | Pfad | Technologie | Zweck |
|---|---|---|---|
| **Frontend** | `packages/frontend/` | React 19 + Vite 8 + TypeScript | User- und Admin-Portal |
| **Backend** | `packages/backend/` | .NET 10 Azure Functions (Isolated Worker) | REST-API |
| **Shared** | `packages/shared/` | TypeScript (generiert aus C#) | Gemeinsame Type-Definitionen |

---

## Frontend (packages/frontend/)

### Tech-Stack

| Layer | Technologie |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| UI | FluentUI V9 (`@fluentui/react-components`, `@fluentui/react-icons`) |
| Auth | `oidc-client-ts` + `react-oidc-context` (Churchtool IDP) |
| Routing | `react-router-dom` v7 |
| Server-State | `@tanstack/react-query` v5 |
| Backend | Azure Functions (packages/backend/) |

### Authentifizierung

- **Auth-Provider**: Churchtool IDP (OIDC)
- **OIDC-Konfiguration**: `src/config/oidc.ts`
- Nach dem Login ruft `AuthProvider` automatisch `GET /api/me` auf
- `isAdmin` und `groups` kommen **ausschliesslich** aus `GET /api/me` (nicht aus OIDC-Claims)
- **Custom Hook**: `useAuth()` aus `src/auth/useAuth.ts` — liefert `{ isAuthenticated, isAdmin, groups, displayName, token, login, logout }`
- **Niemals** OIDC-Claims direkt für Admin-Erkennung verwenden

### Projektstruktur

```
packages/frontend/src/
  auth/          # OIDC-Integration, Route-Guards
  api/           # Alle Backend-Calls (types.ts, client.ts, me.ts, apps.ts, clients.ts, assignments.ts)
  config/        # oidc.ts, api.ts — Werte kommen aus .env (VITE_-Prefix)
  hooks/         # TanStack Query Hooks (useMe, useApps, useAdminApps, useClientRegistration)
  components/    # Wiederverwendbare UI-Komponenten (AppCard, AppGrid, PageShell)
  pages/         # Seitenkomponenten
    admin/       # Admin-spezifische Seiten
  router/        # React Router Konfiguration
```

### Konventionen

- **Named Exports** überall — kein `export default`
- **Komponenten**: PascalCase, eine Komponente pro Datei, als `const`-Arrow-Function
- **Props**: Eigenes `interface` direkt vor der Komponente
- **Styles**: `const useStyles = makeStyles({...})` direkt vor dem Props-Interface
- **Hooks**: `use`-Prefix, eigene Datei unter `src/hooks/`
- **API-Dateien**: Eine Datei pro Ressource (`apps.ts`, `clients.ts`, etc.)
- **FluentUI Styling**: `makeStyles()` aus `@fluentui/react-components` — kein CSS-in-JS, kein Tailwind
- **Icons**: Ausschliesslich aus `@fluentui/react-icons`
- **Formulare**: Keine externe Form-Library — native React State + FluentUI `Field`/`Input`
- **Fehlerbehandlung**: `ApiResponseError` aus `src/api/client.ts` für API-Fehler

### Komponenten-Stil

Reihenfolge innerhalb einer Komponenten-Datei:
1. Imports
2. `const useStyles = makeStyles({...})`
3. `interface XxxProps { ... }`
4. `export const Xxx: React.FunctionComponent<XxxProps> = (props: XxxProps) => { ... }`

Beispiel:
```tsx
const useStyles = makeStyles({
  card: { width: '280px' },
});

interface AppCardProps {
  app: AppDto;
}

export const AppCard: React.FunctionComponent<AppCardProps> = (props: AppCardProps) => {
  const { app } = props;
  const styles = useStyles();
  return <Card className={styles.card}>{/* ... */}</Card>;
};
```

### API-Kontrakt (Backend)

Alle API-Calls laufen über `authFetch()` in `src/api/client.ts` mit Bearer Token.

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/api/me` | `MeDto { userId, displayName, isAdmin, groups[] }` |
| GET | `/api/apps` | Apps des Users (nach Token gefiltert) |
| GET | `/api/appmanagement/apps` | Alle Apps (nur Admin) |
| POST | `/api/appmanagement/apps` | App erstellen |
| PUT | `/api/appmanagement/apps/:id` | App bearbeiten |
| DELETE | `/api/appmanagement/apps/:id` | App löschen |
| POST | `/api/appmanagement/apps/:id/assignments` | User/Gruppen zuweisen |
| POST | `/api/appmanagement/clients` | OAuth2-Client beim Churchtool IDP registrieren |

### Umgebungsvariablen

```env
VITE_OIDC_AUTHORITY=        # Churchtool IDP Basis-URL
VITE_OIDC_CLIENT_ID=        # OIDC Client-ID
VITE_OIDC_REDIRECT_URI=     # Callback-URL (default: /auth/callback)
VITE_API_BASE_URL=          # Azure Functions Base-URL (dev: http://localhost:7071)
```

### Routing

- `/` — App-Portal (nur für eingeloggte User)
- `/admin` — Admin-Dashboard (nur für Admins, sonst Redirect zu `/unauthorized`)
- `/auth/callback` — OIDC-Callback-Handler
- `/unauthorized` — Zugriff verweigert

---

## Backend (packages/backend/)

### Tech-Stack

| Layer | Technologie |
|---|---|
| Runtime | .NET 10 (Isolated Worker) |
| Hosting | Azure Functions v4 |
| HTTP-Integration | ASP.NET Core (`Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`) |
| Telemetrie | Azure Application Insights |
| Table Storage | `GuedesPlace.AzureTools` v1.2.2 — `TypedAzureTableClient<T>` |
| ChurchTool Client | `Fegmm.ChurchTools` v1.0.11 (Kiota-generiert) |
| Auth Middleware | `EaglesJungscharen.Azure.ChurchToolIDPServices` v1.0.0 |

### Authentifizierung & Autorisierung

#### Bearer Token Validierung

Alle Endpunkte sind über Bearer Token gesichert. Die Validierung erfolgt via **Standard OIDC JWT-Middleware** von ASP.NET Core gegen den OIDC Authority Endpoint des Churchtool IDP.

- `AuthorizationLevel` der Azure Functions: `Anonymous` (JWT wird manuell via Middleware validiert)
- Der Bearer Token wird im `Authorization: Bearer <token>` Header mitgeschickt
- Authority URL kommt aus der Konfiguration: `OIDC_AUTHORITY_URL`

#### JWT Claims

Das Churchtool IDP Token enthält nur folgende Claims:
- `sub` → `userId`
- `name` → `displayName`

`isAdmin` und `groups` sind **nicht** im Token und müssen separat von einer Churchtool-API geladen werden.

**Wichtig**: Admin-Checks erfolgen auf Basis von `isAdmin` aus dem Churchtool-API-Aufruf. **Niemals** `isAdmin` aus JWT-Claims ableiten.

### API-Endpunkte

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

> **Wichtig**: Azure Functions reserviert `/api/admin` intern — daher `/api/appmanagement` verwenden.

### Datenzugriff (Azure Table Storage)

Apps und Zuweisungen werden in Azure Table Storage gespeichert. Der Zugriff läuft ausschliesslich über `TypedAzureTableClient<T>` aus dem `GuedesPlace.AzureTools.Tables`-Namespace.

#### Registrierung im DI

```csharp
// In Program.cs via ExtendedAzureTableClientService registrieren
var tableService = new ExtendedAzureTableClientService(connectionString);
tableService.CreateAndRegisterTableClient<AppEntity>("Apps");
tableService.CreateAndRegisterTableClient<AppAssignmentEntity>("AppAssignments");
builder.Services.AddSingleton(tableService);
```

#### Entity-Klassen

Jede Tabelle hat eine dedizierte Entity-Klasse (POCO). Keine Basisklasse oder Attribute nötig — nur public Properties mit Getter/Setter. Arrays und Listen werden automatisch als JSON-String serialisiert.

### Churchtool IDP Integration

OAuth2-Clients werden via HTTP-Calls an das [Churchtool IDP Backend](https://github.com/Eagles-Jungscharen/churchtool-idp-azfunctions) verwaltet. Basis-URL und Function Key kommen aus der Konfiguration.

#### Konfigurationsschlüssel

```env
CHURCHTOOL_IDP_BASE_URL=        # Basis-URL des Churchtool IDP Backends
CHURCHTOOL_IDP_FUNCTION_KEY=    # x-functions-key Header-Wert
CHURCHTOOL_URL=                 # ChurchTools API URL
```

### Fehlerbehandlung

#### Antwortformat

```json
{
  "error": "Die Applikation wurde nicht gefunden.",
  "errorNumber": 1101
}
```

- `error`: Lesbare Fehlermeldung auf **Deutsch**
- `errorNumber`: Eindeutige numerische Fehler-ID

#### Error-Nummern Konvention

| Bereich | Nummernbereich |
|---|---|
| Allgemein / Validierung | 1000–1099 |
| Applikations-Management | 1100–1199 |
| Zuweisungen | 1200–1299 |
| IDP / Client-Registrierung | 1300–1399 |

### Projektstruktur

```
packages/backend/
├── Functions/              # Azure Functions endpoints
├── Services/              # Business logic (Interfaces + Implementierungen)
├── Models/
│   ├── Entities/          # Table Storage Entity-Klassen (class)
│   ├── Dtos/             # Response DTOs (record, camelCase JSON)
│   └── Requests/         # Eingehende Request Bodies (record)
├── Tools/
│   └── DtoTypeGenerator/ # C# → TypeScript DTO-Generator
└── Properties/
```

### Konventionen

- **Code**: Englisch (Klassen-, Methoden-, Variablennamen)
- **Kommentare im Code**: Deutsch (inline `//`-Kommentare)
- **Fehlermeldungen** (im `error`-Feld der JSON-Antwort): Deutsch
- Eine Function-Klasse pro Ressource (nicht pro HTTP-Methode)
- Services via Interface über DI injizieren — nie direkt instanziieren
- `IHttpClientFactory` für alle ausgehenden HTTP-Calls verwenden
- `record` für DTOs und Request-Klassen
- `class` für Entity-Klassen (Table Storage)
- Keine Business-Logik in Function-Klassen — nur HTTP-Binding und Delegation an Services

---

## Shared Package (packages/shared/)

### Type-Synchronisation

**C# als Source of Truth** — TypeScript-Interfaces werden automatisch generiert:

1. **DTOs definieren** in `packages/backend/Models/Dtos/` (C# `record`)
2. **Generator ausführen**: `npm run generate:types`
3. **DtoTypeGenerator** liest C# DTOs via Reflection
4. **Ausgabe**: `packages/shared/src/generated/dtos.ts` mit TypeScript-Interfaces
5. **Frontend importiert**: `import { AppDto, MeDto } from '@eagles-jungscharen/ct-appportal-shared'`

### Konventionen

- **Niemals** manuell `dtos.ts` editieren — wird bei jedem `generate:types` überschrieben
- Zusätzliche manuelle Types in `packages/shared/src/types/` ablegen
- Re-Exports über `packages/shared/src/index.ts`

---

## Monorepo-Konventionen

### Sprachregelungen

- **Code**: Englisch (Klassen-, Methoden-, Variablennamen, Variable Names)
- **Kommentare**: Deutsch (inline-Kommentare in C# und TypeScript)
- **Fehlermeldungen**: Deutsch (User-facing error messages)
- **Dokumentation**: Deutsch (README, docs/)
- **Commit Messages**: Englisch (Conventional Commits)

### Package-Namen

- `@eagles-jungscharen/ct-appportal-frontend`
- `@eagles-jungscharen/ct-appportal-backend` (npm workspace auch für .NET-Projekt)
- `@eagles-jungscharen/ct-appportal-shared`

### Workflow

1. **DTOs ändern**: Backend `Models/Dtos/` editieren
2. **Types generieren**: `npm run generate:types` (vor Frontend-Build)
3. **Environment generieren**: `npm run generate:env` (nach `.env.local`-Änderungen)
4. **Entwicklung**: `npm run dev` (startet Frontend + Backend parallel)
5. **Build**: `npm run build` (baut alle Packages)

### Tools

- **npm workspaces**: Dependency-Management über Root
- **concurrently**: Parallele Ausführung von Frontend/Backend Dev-Servern
- **DtoTypeGenerator**: C# → TypeScript Type-Generator (packages/backend/Tools/)
- **generate-env.js**: Erzeugt package-spezifische `.env`-Dateien aus Root `.env.local`

---

## Wichtige Hinweise für Copilot

### Frontend

- `authFetch<T>(path, token, options?)` immer für API-Calls verwenden — nie direkt `fetch()`
- Admin-Checks immer via `useAuth().isAdmin` — nie über OIDC-Claims
- FluentUI V9 API nutzen (keine V8/V7 Imports) — Package ist `@fluentui/react-components`
- `crypto.randomUUID()` für temporäre IDs in Formularen
- `clientSecret` wird nach OAuth2-Client-Registrierung nur einmalig angezeigt (Security)
- Komponenten als const Arrow-Function, nicht als function-Declaration

### Backend

- Middleware kommt aus `EaglesJungscharen.Azure.ChurchToolIDPServices` NuGet-Paket
- Table Storage ausschliesslich über `TypedAzureTableClient<T>` zugreifen
- Kein `/api/admin`-Prefix (Azure Functions-intern reserviert) — `/api/appmanagement` verwenden
- Admin-Status kommt aus Churchtool-API, **nicht** aus JWT-Claims
- Fehlermeldungen auf Deutsch im Format `{ "error": "...", "errorNumber": 1xxx }`

### Shared

- **Niemals** manuell `packages/shared/src/generated/dtos.ts` editieren
- Nach Backend-DTO-Änderungen immer `npm run generate:types` ausführen
- Frontend importiert Types aus `@eagles-jungscharen/ct-appportal-shared`

### Environment

- **Root `.env.local`** ist die einzige Datei, die manuell gepflegt wird
- `npm run generate:env` erzeugt daraus:
  - `packages/frontend/.env.local` (mit `VITE_*` Variablen)
  - `packages/backend/local.settings.json` (mit Backend-Konfiguration)
- Niemals sensitive Daten in `.env.example` committen
