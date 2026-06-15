#!/bin/bash

# ============================================
# Clean Script — ct-appportal Monorepo
# ============================================
# Löscht alle Build-Artefakte, Dependencies und temporäre Dateien

echo "🧹 Cleaning ct-appportal monorepo..."

# Node.js artifacts
echo "Cleaning Node.js artifacts..."
rm -rf node_modules
rm -rf packages/frontend/node_modules
rm -rf packages/frontend/dist
rm -rf packages/shared/node_modules
rm -rf packages/backend/node_modules

# .NET artifacts
echo "Cleaning .NET artifacts..."
rm -rf packages/backend/bin
rm -rf packages/backend/obj
rm -rf packages/backend/Tools/DtoTypeGenerator/bin
rm -rf packages/backend/Tools/DtoTypeGenerator/obj

# Azurite database files (optional — be careful if you have local data)
echo "Cleaning Azurite databases..."
rm -f __azurite_db_*.json
rm -rf __blobstorage__
rm -rf __queuestorage__
rm -rf azurite

echo "✅ Clean complete!"
echo ""
echo "To reinstall dependencies, run:"
echo "  npm install"
