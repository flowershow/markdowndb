# GitHub Copilot Instructions for MarkdownDB

## Project Overview

MarkdownDB is a JavaScript library that parses markdown files and stores them in a queryable database (SQLite or JSON). It extracts structured data from markdown content including frontmatter, tags, links, and tasks, making it easy to build markdown-powered sites and applications.

## Technology Stack

- **Language**: TypeScript (ES Modules)
- **Runtime**: Node.js
- **Database**: SQLite (via Knex.js)
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Markdown Parsing**: remark (remark-parse, remark-gfm, remark-wiki-link)
- **Schema Validation**: Zod
- **File Watching**: chokidar

## Architecture

The project follows a modular architecture:

```
markdown files → remark-parse → syntax tree → extract features →
→ TypeScript objects (File + Metadata + Tags + Links) →
→ computed fields → SQLite database / JSON files
```

## Key Directories and Files

- `src/lib/` - Core library code
  - `markdowndb.ts` - Main MarkdownDB class with database operations
  - `parseFile.ts` - Markdown parsing and AST processing
  - `process.ts` - File processing without SQL dependencies
  - `schema.ts` - Database schema definitions (Files, Tags, Links, Tasks)
  - `indexFolder.ts` - Folder indexing logic
  - `databaseUtils.ts` - Database utility functions
  - `validate.ts` - Validation utilities
  - `loadConfig.ts` - Configuration loading
- `src/bin/` - CLI entry point
- `src/tests/` - Test files (*.spec.ts)
- `__mocks__/content/` - Mock markdown files for testing

## Code Style and Conventions

### General Guidelines

1. **ES Modules**: Use ES module syntax (import/export), not CommonJS
2. **File Extensions**: Always include `.js` extension in imports (TypeScript will resolve to `.ts`)
3. **Type Safety**: Use TypeScript types explicitly; avoid `any` when possible
4. **Async/Await**: Prefer async/await over promises for asynchronous operations

### Naming Conventions

- **Classes**: PascalCase (e.g., `MarkdownDB`, `MddbFile`)
- **Functions**: camelCase (e.g., `processFile`, `indexFolder`)
- **Constants**: camelCase or PascalCase for enums (e.g., `Table.Files`)
- **Interfaces/Types**: PascalCase (e.g., `FileInfo`, `CustomConfig`)

### Code Organization

- Export main functionality from `src/index.ts`
- Keep database operations in the `MarkdownDB` class
- Separate pure parsing/processing logic from database logic
- Use schema classes (e.g., `MddbFile`) for table definitions

## Testing Practices

- Test files: `*.spec.ts` in `src/tests/`
- Use Jest with ES module support
- Test against mock content in `__mocks__/content/`
- Run tests with: `npm test`
- Pretest builds the project and indexes mock content

### Test Structure

```typescript
// Jest globals (describe, test, expect, beforeAll, etc.) are injected automatically
// and do not need to be imported (this is Jest's default behavior)
import { MarkdownDB } from "../lib/markdowndb";

describe("Feature name", () => {
  test("should do something", async () => {
    // Test implementation
  });
});
```

## Build and Development Workflow

### Commands

- `npm run build` - Compile TypeScript to `dist/`
- `npm run watch` - Watch mode for development
- `npm test` - Run tests (builds first, indexes mock content)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting

### Build Output

- Source: `src/**/*.ts`
- Output: `dist/src/**/*.js` and `dist/src/**/*.d.ts`
- Package exports: `./dist/src/index.js` (main) and types

## Configuration

The library supports a `markdowndb.config.js` file with:

- `computedFields`: Array of functions to add computed fields
- `schemas`: Zod schemas for content validation
- `include`: File patterns to include (micromatch patterns)
- `exclude`: File patterns to exclude (micromatch patterns)

## Key Features to Be Aware Of

### 1. File Processing

- Supports `.md` and `.mdx` files
- Extracts frontmatter (YAML)
- Parses tags from frontmatter and body (`#tag` syntax)
- Extracts wiki-style links (`[[link]]`) and markdown links
- Extracts tasks (`- [ ] task` syntax)

### 2. Computed Fields

Functions that take `(fileInfo, ast)` and add/modify properties on `fileInfo`.

### 3. URL Path Resolution

Default resolver converts file paths to URLs:
- Removes `.md`/`.mdx` extensions
- Removes trailing `index`
- Uses `/` for home page

### 4. Database Schema

Main tables:
- `files` - Core file information
- `tags` - Unique tags
- `file_tags` - Many-to-many relationship
- `links` - Links between files
- `tasks` - Extracted tasks

### 5. Watch Mode

Supports watching directories for changes and updating the database in real-time.

## Common Patterns

### Creating a Database Connection

```typescript
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "sqlite3",
  connection: { filename: "markdown.db" }
});

await client.init();
```

### Indexing Files

```typescript
await client.indexFolder({
  folderPath: "./content",
  customConfig: {
    computedFields: [(fileInfo, ast) => {
      // Add computed fields
    }]
  }
});
```

### Querying Files

```typescript
// All files
const files = await client.getFiles();

// By tags
const tagged = await client.getFiles({ tags: ["tag1"] });

// By frontmatter
const published = await client.getFiles({
  frontmatter: { draft: false }
});
```

## Important Notes

- The library uses SHA-1 hashing for file IDs based on file paths
- Metadata is stored as JSON in the database
- Links can be relative or absolute; resolution handles both
- The CLI tool (`npx mddb`) is defined in `src/bin/index.js` (after build)

## When Adding New Features

1. Add types/interfaces in appropriate files (schema.ts for DB-related)
2. Update the database schema if adding new tables/columns
3. Add processing logic in process.ts or parseFile.ts
4. Update MarkdownDB class methods for new query patterns
5. Add tests in `src/tests/`
6. Update documentation in README.md if user-facing

## Dependencies Management

- Keep dependencies minimal and well-maintained
- Use exact versions for production dependencies
- Document any new dependencies in package.json
