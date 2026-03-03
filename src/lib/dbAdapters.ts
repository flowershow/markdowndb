import { Knex } from "knex";

/**
 * Database adapter utilities for cross-database compatibility.
 * Handles SQL dialect differences for SQLite, MySQL, and PostgreSQL.
 * 
 * NOTE: column and path parameters should be known, safe values (not user input).
 */

/**
 * Returns JSON field extraction syntax for the database client.
 */
function getJsonExtractSyntax(
  client: string,
  column: string,
  path: string
): string {
  const c = client.toLowerCase();
  if (c === "mysql" || c === "mysql2") {
    return `JSON_EXTRACT(${column}, '$.${path}')`;
  }
  if (c === "pg" || c === "postgres" || c === "postgresql") {
    return `${column}->>'${path}'`;
  }
  return `json_extract(${column}, '$.${path}')`; // SQLite default
}

/**
 * Adds a LIKE query with proper case-sensitivity handling.
 * Uses ILIKE for PostgreSQL, LIKE for others.
 */
export function addLikeQuery(
  builder: Knex.QueryBuilder,
  column: string,
  pattern: string,
  client: string
): void {
  const c = client.toLowerCase();
  const operator = (c === "pg" || c === "postgres" || c === "postgresql") ? "ilike" : "like";
  builder.where(column, operator, pattern);
}

/**
 * Adds a JSON field comparison query.
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
 * Adds a JSON field IS NULL query.
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
 * Adds a JSON field LIKE query.
 * Uses ILIKE for PostgreSQL for consistency.
 */
export function addJsonFieldLikeQuery(
  builder: Knex.QueryBuilder,
  client: string,
  column: string,
  path: string,
  pattern: string
): void {
  const c = client.toLowerCase();
  const jsonExtract = getJsonExtractSyntax(client, column, path);
  const operator = (c === "pg" || c === "postgres" || c === "postgresql") ? "ILIKE" : "LIKE";
  builder.whereRaw(`${jsonExtract} ${operator} ?`, [pattern]);
}
