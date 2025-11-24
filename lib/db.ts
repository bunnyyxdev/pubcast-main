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
 * Converts $1, $2, etc. placeholders to tagged template literals for Neon
 */
export async function query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const sql = getSql();
  const start = Date.now();
  
  try {
    if (params && params.length > 0) {
      // Convert parameterized query ($1, $2, etc.) to tagged template literal
      // Split by $1, $2, etc. and build template literal
      const parts: string[] = [];
      const values: any[] = [];
      let lastIndex = 0;
      
      // Find all $1, $2, etc. positions
      const paramRegex = /\$(\d+)/g;
      let match;
      const paramIndices = new Set<number>();
      
      // First pass: collect all parameter indices
      while ((match = paramRegex.exec(text)) !== null) {
        const index = parseInt(match[1]);
        paramIndices.add(index);
      }
      
      // Reset regex
      paramRegex.lastIndex = 0;
      
      // Second pass: build template parts and values
      while ((match = paramRegex.exec(text)) !== null) {
        // Add text before the parameter
        parts.push(text.substring(lastIndex, match.index));
        
        // Get parameter index (convert from 1-based to 0-based)
        const index = parseInt(match[1]) - 1;
        if (params[index] !== undefined) {
          values.push(params[index]);
        } else {
          values.push(null);
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      parts.push(text.substring(lastIndex));
      
      // Execute using tagged template literal
      // Neon expects: sql`text ${value1} text ${value2}`
      // Create proper TemplateStringsArray with raw property
      const templateStrings = parts as unknown as TemplateStringsArray;
      (templateStrings as any).raw = parts;
      const result = await (sql as any)(templateStrings, ...values);
      const duration = Date.now() - start;
      const rows = Array.isArray(result) ? result : [result];
      console.log('Executed query', { duration, rows: rows.length });
      return { rows, rowCount: rows.length };
    } else {
      // No parameters, use tagged template literal directly
      const result = await (sql as any)`${text}`;
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

