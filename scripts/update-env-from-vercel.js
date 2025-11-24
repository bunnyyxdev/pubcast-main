/**
 * Helper script to update .env.local with correct DATABASE_URL
 * 
 * Usage:
 * 1. Copy DATABASE_URL from Vercel Dashboard
 * 2. Run: node scripts/update-env-from-vercel.js "postgresql://..."
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const newDatabaseUrl = process.argv[2];

if (!newDatabaseUrl) {
  console.log('❌ Please provide DATABASE_URL as argument');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/update-env-from-vercel.js "postgresql://user:pass@host/db?sslmode=require"');
  console.log('');
  console.log('To get the correct DATABASE_URL:');
  console.log('  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('  2. Or go to Integrations → Neon → View connection string');
  console.log('  3. Copy the DATABASE_URL value');
  process.exit(1);
}

if (!newDatabaseUrl.startsWith('postgresql://')) {
  console.error('❌ Invalid DATABASE_URL format. Must start with postgresql://');
  process.exit(1);
}

// Extract unpooled URL (replace -pooler with direct endpoint)
const unpooledUrl = newDatabaseUrl.replace('-pooler.', '.');

const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

// Read existing .env.local
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  // Create new file with basic structure
  envContent = `PROMPTPAY_ID=0988870075
NEXT_PUBLIC_DEFAULT_PROMPTPAY_ID=0988870075
LINE_NOTIFY_TOKEN=your_line_notify_token_here

LINE_CHANNEL_SECRET=c90326baabd814ca9bd66a8e44376a60

`;
}

// Update or add DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
  envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${newDatabaseUrl}`);
} else {
  envContent += `\n# PostgreSQL (Neon Database) - Vercel Integration\nDATABASE_URL=${newDatabaseUrl}\n`;
}

// Update or add DATABASE_URL_UNPOOLED
if (envContent.includes('DATABASE_URL_UNPOOLED=')) {
  envContent = envContent.replace(/DATABASE_URL_UNPOOLED=.*/g, `DATABASE_URL_UNPOOLED=${unpooledUrl}`);
} else {
  envContent += `DATABASE_URL_UNPOOLED=${unpooledUrl}\n`;
}

// Write back to file
fs.writeFileSync(envPath, envContent, 'utf8');

const maskedUrl = newDatabaseUrl.replace(/:[^:@]+@/, ':****@');
const maskedUnpooled = unpooledUrl.replace(/:[^:@]+@/, ':****@');

console.log('✅ Updated .env.local successfully!');
console.log('');
console.log('DATABASE_URL:', maskedUrl);
console.log('DATABASE_URL_UNPOOLED:', maskedUnpooled);
console.log('');
console.log('You can now test the connection with:');
console.log('  npm run test-connection');

