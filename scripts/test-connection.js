/**
 * Quick Connection Test
 * Tests Neon PostgreSQL connection with @neondatabase/serverless
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function test() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const maskedUrl = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('🔌 Testing Neon connection to:', maskedUrl);

  const sql = neon(connectionString);

  try {
    // Test basic query
    const result = await sql`SELECT NOW() as time, version() as version`;
    const row = Array.isArray(result) ? result[0] : result;
    console.log('✅ Connected successfully!');
    console.log('   Time:', row.time);
    console.log('   Version:', row.version.split(' ')[0] + ' ' + row.version.split(' ')[1]);
    
    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableRows = Array.isArray(tables) ? tables : [tables];
    console.log(`   Tables: ${tableRows.length} found`);
    if (tableRows.length > 0) {
      console.log('   Table names:', tableRows.map(t => t.table_name).join(', '));
    }
    
    // Test parameterized query using query() function
    const { query } = require('../lib/db');
    const testQuery = await query('SELECT COUNT(*) as count FROM users WHERE id = $1', [999999]);
    console.log('   Test query() function: ✅');
    
    console.log('\n✅ Connection test passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }
}

test();

