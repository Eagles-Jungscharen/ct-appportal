#!/bin/bash

# Start Azurite Storage Emulator for local development

echo "🚀 Starting Azurite Storage Emulator..."

# Create azurite directory if it doesn't exist
mkdir -p azurite

# Start Azurite in silent mode
azurite --silent --location ./azurite --debug ./azurite/debug.log

# If Azurite is not installed, show installation instructions
if [ $? -ne 0 ]; then
  echo "❌ Azurite is not installed."
  echo ""
  echo "Install with:"
  echo "  npm install -g azurite"
  echo ""
  echo "Or run via npx:"
  echo "  npx azurite --silent --location ./azurite --debug ./azurite/debug.log"
fi
