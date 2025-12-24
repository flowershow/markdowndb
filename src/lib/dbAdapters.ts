import { Knex } from "knex";

/**
 * Database adapter utilities for handling database-specific queries
 * Supports SQLite, MySQL, and PostgreSQL
 */

export type DatabaseClient = "sqlite3" | "mysql" | "mysql2" | "pg" | "postgres";

/**
 * Gets the JSON extraction syntax for the specified database client
 * @param client - The database client type
 * @param column - The column name containing JSON data (should be a safe, known column name)
 * @param path - The JSON path to extract (should be a safe, known path, not user input)
 * @returns SQL fragment for JSON extraction
 * 
 * SECURITY NOTE: This function is intended for use with known, safe column names and paths
 * defined in the codebase (e.g., 'metadata', 'key'). Do NOT pass user input directly to
 * these parameters as they are interpolated into SQL strings. All calls in MarkdownDB use
 * hardcoded, safe values.
 */
export function getJsonExtractSyntax(
  client: string,
  column: string,
  path: string
): string {
  const normalizedClient = client.toLowerCase();

  switch (normalizedClient) {
    case "sqlite3":
    case "sqlite":
      return `json_extract(${column}, '$.${path}')`;
    case "mysql":
    case "mysql2":
      return `JSON_EXTRACT(${column}, '$.${path}')`;
    case "pg":
    case "postgres":
    case "postgresql":
      return `${column}->>'${path}'`;
    default:
      // Default to SQLite syntax
      return `json_extract(${column}, '$.${path}')`;
  }
}

/**
 * Adds a LIKE query to the Knex query builder with proper syntax for the database
 * @param builder - Knex query builder
 * @param column - Column name to search (should be a safe, known column name)
 * @param pattern - Pattern to match (passed as a parameter, safe from SQL injection)
 * @param client - Database client type
 * 
 * Note: LIKE behavior varies by database:
 * - SQLite: LIKE is case-insensitive by default for ASCII characters
 * - MySQL: LIKE case-sensitivity depends on collation (usually case-insensitive)
 * - PostgreSQL: LIKE is case-sensitive; ILIKE is case-insensitive (used here for consistency)
 * 
 * SECURITY NOTE: The column parameter should be a known, safe column name from the codebase.
 * The pattern parameter is safely passed as a query parameter (protected from SQL injection).
 */
export function addLikeQuery(
  builder: Knex.QueryBuilder,
  column: string,
  pattern: string,
  client: string
): void {
  const normalizedClient = client.toLowerCase();

  // Use ILIKE for PostgreSQL for case-insensitive matching
  if (normalizedClient === "pg" || normalizedClient === "postgres" || normalizedClient === "postgresql") {
    builder.where(column, "ilike", pattern);
  } else {
    // Use LIKE for SQLite and MySQL
    builder.where(column, "like", pattern);
  }
}

/**
 * Gets a JSON field comparison query builder
 * @param builder - Knex query builder
 * @param client - Database client type
 * @param column - Column containing JSON data (should be a safe, known column name)
 * @param path - JSON path to the field (should be a safe, known path)
 * @param operator - Comparison operator (=, !=, >, <, etc.)
 * @param value - Value to compare against (passed as parameter, safe from SQL injection)
 * 
 * SECURITY NOTE: column and path should be known, safe values from the codebase.
 * The value parameter is safely passed as a query parameter.
 */
export function addJsonFieldQuery(
  builder: Knex.QueryBuilder,
  client: string,
  column: string,
  path: string,
  operator: string,
  value: any
): void {
  const jsonExtract = getJsonExtractSyntax(client, column, path);
  builder.whereRaw(`${jsonExtract} ${operator} ?`, [value]);
}

/**
 * Gets a JSON field IS NULL query builder
 * @param builder - Knex query builder
 * @param client - Database client type
 * @param column - Column containing JSON data (should be a safe, known column name)
 * @param path - JSON path to the field (should be a safe, known path)
 * 
 * SECURITY NOTE: column and path should be known, safe values from the codebase.
 */
export function addJsonFieldIsNullQuery(
  builder: Knex.QueryBuilder,
  client: string,
  column: string,
  path: string
): void {
  const jsonExtract = getJsonExtractSyntax(client, column, path);
  builder.whereRaw(`${jsonExtract} IS NULL`);
}

/**
 * Gets a JSON field LIKE query builder (for array/object matching)
 * @param builder - Knex query builder
 * @param client - Database client type
 * @param column - Column containing JSON data (should be a safe, known column name)
 * @param path - JSON path to the field (should be a safe, known path)
 * @param pattern - Pattern to match (passed as parameter, safe from SQL injection)
 * 
 * SECURITY NOTE: column and path should be known, safe values from the codebase.
 * The pattern parameter is safely passed as a query parameter.
 */
export function addJsonFieldLikeQuery(
  builder: Knex.QueryBuilder,
  client: string,
  column: string,
  path: string,
  pattern: string
): void {
  const normalizedClient = client.toLowerCase();
  const jsonExtract = getJsonExtractSyntax(client, column, path);
  
  // Use ILIKE for PostgreSQL for case-insensitive matching, consistent with addLikeQuery
  const likeOperator = 
    (normalizedClient === "pg" || normalizedClient === "postgres" || normalizedClient === "postgresql")
      ? "ILIKE"
      : "LIKE";
  
  builder.whereRaw(`${jsonExtract} ${likeOperator} ?`, [pattern]);
}
