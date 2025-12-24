import { Knex } from "knex";

/**
 * Database adapter utilities for handling database-specific queries
 * Supports SQLite, MySQL, and PostgreSQL
 */

export type DatabaseClient = "sqlite3" | "mysql" | "mysql2" | "pg" | "postgres";

/**
 * Gets the JSON extraction syntax for the specified database client
 * @param client - The database client type
 * @param column - The column name containing JSON data
 * @param path - The JSON path to extract (e.g., 'key' or 'nested.key')
 * @returns SQL fragment for JSON extraction
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
 * @param column - Column name to search
 * @param pattern - Pattern to match
 * @param client - Database client type
 * 
 * Note: This uses case-sensitive LIKE for all databases.
 * - SQLite: LIKE is case-insensitive by default for ASCII characters
 * - MySQL: LIKE case-sensitivity depends on collation (usually case-insensitive)
 * - PostgreSQL: LIKE is case-sensitive; use ILIKE for case-insensitive matching
 * 
 * For PostgreSQL case-insensitive queries, consider using ILIKE directly in your
 * application code or adjusting the column collation.
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
 * @param column - Column containing JSON data
 * @param path - JSON path to the field
 * @param operator - Comparison operator (=, !=, >, <, etc.)
 * @param value - Value to compare against
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
 * @param column - Column containing JSON data
 * @param path - JSON path to the field
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
 * @param column - Column containing JSON data
 * @param path - JSON path to the field
 * @param pattern - Pattern to match
 */
export function addJsonFieldLikeQuery(
  builder: Knex.QueryBuilder,
  client: string,
  column: string,
  path: string,
  pattern: string
): void {
  const jsonExtract = getJsonExtractSyntax(client, column, path);
  builder.whereRaw(`${jsonExtract} LIKE ?`, [pattern]);
}
