import { initializeApp, cert } from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firebaseadmin = null;

function parseServiceAccount(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;

  let str = String(raw).trim();

  // 1. Check if it's a file path
  try {
    const resolvedPath = path.isAbsolute(str) ? str : path.resolve(process.cwd(), str);
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const fileContent = fs.readFileSync(resolvedPath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (_) {}

  // 2. Check if Base64 encoded
  if (!str.startsWith('{') && /^[A-Za-z0-9+/=]+$/.test(str.replace(/\s+/g, ''))) {
    try {
      const decoded = Buffer.from(str, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        return JSON.parse(decoded);
      }
    } catch (_) {}
  }

  // 3. If enclosed in outer quotes
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    const unquoted = str.slice(1, -1).trim();
    if (unquoted.startsWith('{')) {
      str = unquoted;
    }
  }

  // 4. Try direct JSON parse
  try {
    return JSON.parse(str);
  } catch (err1) {
    // 5. Try auto-repairing missing commas between JSON properties
    try {
      let repaired = str.replace(/(["\d]|true|false|null|\]|\})\s*\n?\s*(?="[a-zA-Z0-9_]+"\s*:)/g, '$1, ');
      repaired = repaired.replace(/,\s*([\}\]])/g, '$1');
      return JSON.parse(repaired);
    } catch (_) {
      try {
        // Also fix unescaped newlines in private key
        let keyRepaired = str.replace(/"private_key"\s*:\s*"([^"]+)"/s, (match, p1) => {
          return `"private_key": "${p1.replace(/\r?\n/g, '\\n')}"`;
        });
        let repaired = keyRepaired.replace(/(["\d]|true|false|null|\]|\})\s*\n?\s*(?="[a-zA-Z0-9_]+"\s*:)/g, '$1, ');
        repaired = repaired.replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(repaired);
      } catch (_) {
        // Log helpful context around the error position
        const match = err1.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1], 10);
          const start = Math.max(0, pos - 50);
          const end = Math.min(str.length, pos + 50);
          console.error(`[Firebase] Syntax error near position ${pos}: "...${str.slice(start, end)}..."`);
        }
        throw err1;
      }
    }
  }
}

try {
  let serviceAccount = null;
  const rawCreds = process.env.FIERBASESDK || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (rawCreds) {
    try {
      serviceAccount = parseServiceAccount(rawCreds);
    } catch (err) {
      console.warn('[Firebase] Warning: Failed to parse credentials from env:', err.message);
    }
  }

  if (!serviceAccount) {
    // Check common service account JSON file locations
    const candidateFiles = [
      path.resolve(process.cwd(), 'firebase-service-account.json'),
      path.resolve(process.cwd(), 'serviceAccountKey.json'),
      path.resolve(process.cwd(), 'config/firebase-service-account.json'),
    ];
    for (const file of candidateFiles) {
      if (fs.existsSync(file)) {
        try {
          serviceAccount = JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`[Firebase] Loaded service account from ${file}`);
          break;
        } catch (_) {}
      }
    }
  }

  if (serviceAccount) {
    // Ensure escaped newlines in private_key are converted to actual newlines for PEM format
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    firebaseadmin = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('[Firebase] Admin SDK initialized successfully');
  } else {
    console.warn('[Firebase] Warning: FIERBASESDK environment variable is not defined.');
  }
} catch (error) {
  console.error('[Firebase] Failed to initialize Firebase Admin SDK:', error.message);
}

export default firebaseadmin;