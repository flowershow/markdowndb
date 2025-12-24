/**
 * Public API for processing individual markdown files or strings.
 * 
 * This module provides a stable public API that reuses the core markdown
 * processing logic from process.ts. The processMarkdown function uses the
 * same processMarkdownContent function that processFile uses internally,
 * but without the file system dependencies.
 */
import { processMarkdownContent } from "./process.js";
import { ParsingOptions, WikiLink } from "./parseFile.js";
import { Root } from "remark-parse/lib/index.js";
import { MetaData, Task } from "./schema.js";

/**
 * Result of processing a markdown file or string.
 */
export interface MarkdownProcessorResult {
  /**
   * The abstract syntax tree (AST) of the markdown content.
   */
  ast: Root;
  /**
   * Metadata extracted from frontmatter and body.
   * Always includes `tags` (array of strings from frontmatter and body)
   * and `tasks` (array of task objects from checklist items).
   */
  metadata: MetaData & {
    tags: string[];
    tasks: Task[];
  };
  /**
   * Links found in the markdown content (wiki-style links, regular links, images).
   */
  links: WikiLink[];
}

/**
 * Options for processing markdown content.
 */
export type MarkdownProcessorOptions = ParsingOptions;

/**
 * Process a single markdown file or string and extract structured data.
 * 
 * This function processes markdown content without requiring file system access
 * or database operations. It's ideal for use cases like:
 * - **Cloudflare Workers** - Process markdown at the edge
 * - **Edge functions** - Serverless markdown processing  
 * - **API endpoints** - Parse markdown in HTTP handlers
 * - **Stream processing** - Process markdown from streams/buffers
 * 
 * **Implementation**: This function reuses `processMarkdownContent` from process.ts,
 * which is the same core logic used by `processFile`. This ensures consistency
 * between file-based and string-based markdown processing.
 * 
 * **Note**: This function processes markdown in isolation and does NOT:
 * - Compute backlinks (requires knowledge of other files)
 * - Resolve Obsidian-style shortest path links (requires folder context)  
 * - Store results in a database
 * - Generate file IDs or URL paths (file-system specific features)
 * 
 * @param source - The markdown content as a string
 * @param options - Optional configuration for parsing
 * @returns Processed markdown data including AST, metadata, links, tags, and tasks
 * 
 * @example
 * ```typescript
 * import { processMarkdown } from 'mddb';
 * 
 * const markdown = `---
 * title: My Document
 * tags: [javascript, tutorial]
 * ---
 * 
 * # Hello World
 * 
 * This is a [[wiki-link]] and a [regular link](./other.md).
 * 
 * - [ ] This is a task
 * `;
 * 
 * const result = processMarkdown(markdown);
 * console.log(result.metadata.title); // "My Document"
 * console.log(result.metadata.tags); // ["javascript", "tutorial"]
 * console.log(result.links); // Array of link objects
 * ```
 * 
 * @example
 * ```typescript
 * // With options for relative link resolution
 * const result = processMarkdown(markdown, {
 *   from: "blog/post.md", // Source file path for resolving relative links
 *   remarkPlugins: [myCustomPlugin], // Custom remark plugins
 * });
 * ```
 */
export function processMarkdown(
  source: string,
  options?: MarkdownProcessorOptions
): MarkdownProcessorResult {
  // Use the shared processing function from process.ts
  // No computed fields needed for standalone processing
  const { ast, fileInfo } = processMarkdownContent(source, options);
  
  // Return with proper typing - merge tags and tasks into metadata
  return {
    ast,
    metadata: {
      ...fileInfo.metadata,
      tags: fileInfo.tags,
      tasks: fileInfo.tasks,
    },
    links: fileInfo.links,
  } as MarkdownProcessorResult;
}
