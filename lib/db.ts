import { neon } from '@neondatabase/serverless';

/**
 * Get Neon database connection
 * Uses @neondatabase/serverless for optimal serverless performance
 */
let sql: ReturnType<typeof neon> | null = null;

/**
 * Get or create Neon SQL client
 */
export function getSql() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
    }

    sql = neon(connectionString);
  }

  return sql;
}

/**
 * Execute a parameterized query (for compatibility with existing code)
 * Converts $1, $2, etc. to template literal format for Neon
 */
export async function query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const sql = getSql();
  const start = Date.now();
  
  try {
    if (params && params.length > 0) {
      // Convert parameterized query ($1, $2, etc.) to template literal
      // Split by $1, $2, etc. and build template literal
      const parts: string[] = [];
      const values: any[] = [];
      let lastIndex = 0;
      
      // Find all $1, $2, etc. positions
      const paramRegex = /\$(\d+)/g;
      let match;
      let paramIndex = 0;
      
      while ((match = paramRegex.exec(text)) !== null) {
        // Add text before the parameter
        parts.push(text.substring(lastIndex, match.index));
        
        // Get parameter index
        const index = parseInt(match[1]) - 1;
        if (params[index] !== undefined) {
          values.push(params[index]);
        } else {
          values.push(null);
        }
        
        lastIndex = match.index + match[0].length;
        paramIndex++;
      }
      
      // Add remaining text
      parts.push(text.substring(lastIndex));
      
      // Execute using template literal
      const result = await sql(parts as any, ...values);
      const duration = Date.now() - start;
      const rows = Array.isArray(result) ? result : [result];
      console.log('Executed query', { duration, rows: rows.length });
      return { rows, rowCount: rows.length };
    } else {
      // No parameters, execute directly
      const result = await sql([text] as any);
      const duration = Date.now() - start;
      const rows = Array.isArray(result) ? result : [result];
      console.log('Executed query', { duration, rows: rows.length });
      return { rows, rowCount: rows.length };
    }
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

