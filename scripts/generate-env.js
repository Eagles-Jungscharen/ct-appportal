#!/usr/bin/env node

/**
 * Generate environment files for frontend and backend from root .env.local
 * 
 * Usage: node scripts/generate-env.js
 * 
 * Reads: .env.local (root)
 * Creates:
 *   - packages/frontend/.env.local (VITE_* variables)
 *   - packages/backend/local.settings.json (Backend configuration)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const ROOT_ENV_FILE = path.join(ROOT_DIR, '.env.local');
const FRONTEND_ENV_FILE = path.join(ROOT_DIR, 'packages/frontend/.env.local');
const BACKEND_SETTINGS_FILE = path.join(ROOT_DIR, 'packages/backend/local.settings.json');

// Environment Variable Mappings
const FRONTEND_VITE_VARS = [
  'VITE_OIDC_AUTHORITY',
  'VITE_OIDC_CLIENT_ID',
  'VITE_OIDC_REDIRECT_URI',
  'VITE_OIDC_POST_LOGOUT_REDIRECT_URI',
  'VITE_API_BASE_URL',
  'VITE_ORGANIZATION_NAME',
  'VITE_APP_PORTAL_TITLE',
  'VITE_APP_ICON_URL',
];

const BACKEND_VAR_MAPPING = {
  'AZURE_WEB_JOBS_STORAGE': 'AzureWebJobsStorage',
  'FUNCTIONS_WORKER_RUNTIME': 'FUNCTIONS_WORKER_RUNTIME',
  'APPLICATIONINSIGHTS_CONNECTION_STRING': 'APPLICATIONINSIGHTS_CONNECTION_STRING',
  'OIDC_AUTHORITY_URL': 'OIDC_AUTHORITY_URL',
  'CHURCHTOOL_IDP_BASE_URL': 'CHURCHTOOL_IDP_BASE_URL',
  'CHURCHTOOL_IDP_FUNCTION_KEY': 'CHURCHTOOL_IDP_FUNCTION_KEY',
  'CHURCHTOOL_URL': 'CHURCHTOOL_URL',
  'CHURCHTOOL_ADMIN_GROUP_ID': 'CHURCHTOOL_ADMIN_GROUP_ID',
  'CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING': 'CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING',
};

const CORS_VAR_MAPPING = {
  'CORS_ORIGINS': 'CORS',
  'CORS_CREDENTIALS': 'CORSCredentials',
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: ${filePath} not found`);
    console.log(`\nPlease create .env.local from .env.example:`);
    console.log(`  cp .env.example .env.local`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      env[key] = value;
    }
  });

  return env;
}

function generateFrontendEnv(env) {
  const lines = ['# Auto-generated from root .env.local', '# DO NOT EDIT MANUALLY', ''];

  FRONTEND_VITE_VARS.forEach(key => {
    if (env[key] !== undefined) {
      lines.push(`${key}=${env[key]}`);
    }
  });

  const content = lines.join('\n') + '\n';
  fs.writeFileSync(FRONTEND_ENV_FILE, content);
  console.log(`✅ Generated: ${FRONTEND_ENV_FILE}`);
}

function generateBackendSettings(env) {
  const values = {};
  const host = {};

  // Map environment variables to backend config
  Object.entries(BACKEND_VAR_MAPPING).forEach(([envKey, configKey]) => {
    if (env[envKey] !== undefined) {
      values[configKey] = env[envKey];
    }
  });

  // Map CORS configuration
  Object.entries(CORS_VAR_MAPPING).forEach(([envKey, configKey]) => {
    if (env[envKey] !== undefined) {
      // Convert string "true"/"false" to boolean for CORSCredentials
      if (configKey === 'CORSCredentials') {
        host[configKey] = env[envKey].toLowerCase() === 'true';
      } else {
        host[configKey] = env[envKey];
      }
    }
  });

  const settings = {
    IsEncrypted: false,
    Values: values,
    Host: host,
  };

  fs.writeFileSync(BACKEND_SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');
  console.log(`✅ Generated: ${BACKEND_SETTINGS_FILE}`);
}

function main() {
  console.log('🔧 Generating environment files from .env.local...\n');

  // Parse root .env.local
  const env = parseEnvFile(ROOT_ENV_FILE);

  // Generate frontend .env.local
  generateFrontendEnv(env);

  // Generate backend local.settings.json
  generateBackendSettings(env);

  console.log('\n✅ Environment files generated successfully!');
  console.log('\nNext steps:');
  console.log('  1. Review generated files');
  console.log('  2. Run: npm run dev');
}

main();
