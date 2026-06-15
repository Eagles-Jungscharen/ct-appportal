# Frontend — ct-appportal

React 19 + Vite 8 Frontend für das ct-appportal. Stellt die Benutzeroberfläche bereit, über die Benutzer ihre zugewiesenen Applikationen sehen können und Administratoren neue Apps registrieren und verwalten.

## Tech-Stack

- **React 19** mit TypeScript
- **Vite 8** als Build-Tool
- **FluentUI V9** für UI-Komponenten
- **React Router v7** für Routing
- **TanStack Query v5** für Server-State-Management
- **react-oidc-context** für OIDC-Authentication

## Entwicklung

### Voraussetzungen

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0

### Lokale Entwicklung starten

```bash
# Im Monorepo-Root
npm run dev:frontend

# Oder direkt im Frontend-Package
cd packages/frontend
npm run dev
```

Die App läuft auf: http://localhost:5173

### Backend-Verbindung

Das Frontend kommuniziert mit dem Backend via Vite-Proxy:
- `/api/*` wird automatisch zu `http://localhost:7071` proxied (konfiguriert in `vite.config.ts`)
- Das Backend muss parallel laufen: `npm run dev:backend` (im Root-Ordner)

## Projektstruktur

```
src/
├── api/           # Backend-API-Clients (authFetch, apps, me, clients, assignments)
├── auth/          # OIDC-Provider, Route-Guards
├── components/    # Wiederverwendbare UI-Komponenten
├── config/        # Konfiguration (OIDC, API-Base-URL)
├── context/       # React Contexts (Auth)
├── hooks/         # Custom React Hooks (TanStack Query)
├── pages/         # Seiten-Komponenten (Admin, Portal, Landing)
├── router/        # React Router Setup
└── main.tsx       # App Entry Point
```

## Environment Variables

Environment-Variablen werden über `.env.local` gesteuert (wird via Root-Script aus Root `.env.local` generiert):

```env
VITE_OIDC_AUTHORITY=           # Churchtool IDP Basis-URL
VITE_OIDC_CLIENT_ID=           # OIDC Client-ID
VITE_OIDC_REDIRECT_URI=        # Callback-URL
VITE_API_BASE_URL=             # Backend-URL (dev: http://localhost:7071)
VITE_ORGANIZATION_NAME=        # Organisationsname (UI-Anzeige)
VITE_APP_PORTAL_TITLE=         # Portal-Titel
```

**Wichtig**: `.env.local` wird automatisch generiert via:
```bash
npm run generate:env
```
(im Monorepo-Root ausführen)

## Type-Synchronisation

Das Frontend verwendet **automatisch generierte TypeScript-Types** aus dem Backend:

```typescript
import { AppDto, MeDto, GroupDto } from '@eagles-jungscharen/ct-appportal-shared';
```

Nach Änderungen an Backend-DTOs:
```bash
npm run generate:types  # Im Root ausführen
```

## Coding-Konventionen

### Komponenten

- **Named Exports** (kein `export default`)
- **Arrow Functions**: `export const MyComponent: React.FunctionComponent<Props> = (props) => { ... }`
- **Props-Interface** direkt vor der Komponente definieren
- **Styles** via `makeStyles()` von FluentUI

Beispiel:
```tsx
const useStyles = makeStyles({
  container: { padding: '20px' },
});

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FunctionComponent<MyComponentProps> = (props) => {
  const styles = useStyles();
  return <div className={styles.container}>{props.title}</div>;
};
```

### API-Calls

- Immer `authFetch<T>(path, token, options)` verwenden (aus `src/api/client.ts`)
- **Niemals** direkt `fetch()` aufrufen
- TanStack Query für alle Server-State-Operationen

### Authentication

- Admin-Status kommt **ausschliesslich** aus `GET /api/me` (nicht aus OIDC-Token-Claims)
- Custom Hook: `useAuth()` für Auth-State
- Route-Guards: `<ProtectedRoute>`, `<AdminRoute>`

## Build

### Development Build

```bash
npm run build
```

Ausgabe: `dist/`

### Production Build

```bash
npm run build
```

Das Frontend wird als statische Dateien gebaut und kann auf Azure Static Web Apps oder einem CDN gehostet werden.

## Linting

```bash
npm run lint
```

ESLint-Regeln:
- React Hooks Rules
- TypeScript Strict Mode
- React Refresh Rules

## API-Endpunkte (Backend)

Alle Endpunkte benötigen Bearer-Token (automatisch via `authFetch` hinzugefügt):

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/api/me` | Aktueller User (MeDto) |
| GET | `/api/apps` | User's Apps (nach Gruppen gefiltert) |
| GET | `/api/appmanagement/apps` | Alle Apps (Admin) |
| POST | `/api/appmanagement/apps` | App erstellen (Admin) |
| PUT | `/api/appmanagement/apps/:id` | App bearbeiten (Admin) |
| DELETE | `/api/appmanagement/apps/:id` | App löschen (Admin) |
| POST | `/api/appmanagement/apps/:id/assignments` | Gruppen zuweisen (Admin) |
| POST | `/api/appmanagement/clients` | OAuth2-Client registrieren (Admin) |

## Troubleshooting

### Backend nicht erreichbar

- Prüfe, ob das Backend läuft: `npm run dev:backend` (im Root)
- Prüfe `VITE_API_BASE_URL` in `.env.local`
- Prüfe Vite-Proxy-Konfiguration in `vite.config.ts`

### OIDC-Fehler

- Prüfe `VITE_OIDC_AUTHORITY`, `VITE_OIDC_CLIENT_ID` in `.env.local`
- Stelle sicher, dass die Redirect-URI im Churchtool IDP registriert ist

### Type-Fehler nach Backend-Änderung

```bash
npm run generate:types  # Im Root ausführen
```

## Weitere Informationen

Siehe Monorepo-Root-Dokumentation:
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [DEVELOPMENT.md](../../docs/DEVELOPMENT.md)
