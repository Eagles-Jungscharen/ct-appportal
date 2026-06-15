# Lokale Entwicklungsumgebung

Dieses Verzeichnis enthält Scripts und Konfigurationen für die lokale Entwicklung.

## Azurite (Azure Storage Emulator)

### Installation

```bash
npm install -g azurite
```

### Starten

```bash
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

Oder nutze das bereitgestellte Script:

```bash
sh infrastructure/local/azurite-start.sh
```

### Verbindung

Azurite läuft standardmässig auf:
- **Blob Service**: http://127.0.0.1:10000
- **Queue Service**: http://127.0.0.1:10001
- **Table Service**: http://127.0.0.1:10002

Connection String für lokale Entwicklung:
```
UseDevelopmentStorage=true
```

## Weitere Tools

- **Azure Functions Core Tools**: Für lokales Backend
- **Node.js & npm**: Für Frontend-Entwicklung
- **.NET SDK 10**: Für Backend-Kompilierung

## Troubleshooting

### Azurite Ports bereits belegt

```bash
# Finde Prozess auf Port 10000
lsof -i :10000

# Beende Prozess
kill <PID>
```

### Azurite-Datenbanken zurücksetzen

```bash
rm -rf azurite/
rm -f __azurite_db_*.json
```
