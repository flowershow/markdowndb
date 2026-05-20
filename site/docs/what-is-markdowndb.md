---
title: What is MarkdownDB?
---

# What is MarkdownDB?

MarkdownDB is two things: a **pattern** and a **library**.

**The pattern**: treat a collection of markdown files as a database — each file is a record, its frontmatter and tags are structured fields, and you can query across them as you would any SQL database.

**The library**: a JavaScript tool that implements that pattern. It indexes your markdown files into SQLite (or MySQL/PostgreSQL), extracts structured data like frontmatter, tags, links, and tasks, and gives you a clean API to query that data.

## The Core Idea

Markdown files are unusual: they combine unstructured prose with structured metadata. Most tools treat them as documents to be rendered. MarkdownDB treats them as *records in a database*.

This turns out to be surprisingly powerful. A folder of markdown files becomes a queryable collection. You can ask:

- *Get all blog posts tagged "tutorial" published in the last six months*
- *Find all documents that link back to this page*
- *List every unfinished task across my notes*

## The Pattern: Markdown Files as Records

A MarkdownDB has two components — just like any database:

1. **The data**: your markdown files
2. **The index**: an SQLite database generated from those files

The mapping is simple:

- Each markdown file is a **record**
- Each directory can be a **table** (if you want it to be)
- Frontmatter fields become **queryable columns**
- Tags, links, and tasks are extracted into **related tables**

### Example

```
my-collection/
  movies/
    return-of-the-jedi.md
    a-new-hope.md
  blog/
    first-post.md
```

`movies/return-of-the-jedi.md`:

```md
---
year: 1983
budget: 32.7
director: Richard Marquand
---

# Return of the Jedi

Return of the Jedi is a 1983 American epic space opera film directed
by Richard Marquand...
```

After indexing, you can query with SQL:

```sql
SELECT * FROM files
WHERE json_extract(metadata, '$.year') < 1985;
```

Or via the JavaScript API:

```js
const films = await mddb.getFiles({ folder: "movies" });
```

## What Makes MarkdownDB Different

MarkdownDB has a deliberately narrow scope: build an index, provide an API. It does not get involved in rendering or site generation.

- **Stack-agnostic** — works with Next.js, Astro, Nuxt, or no framework at all. Unlike Nuxt Content or Astro's content collections, it is not tied to a particular stack.
- **SQL-native** — standard SQL rather than a bespoke query language; no reinventing the wheel.
- **Extracts more than frontmatter** — inline body tags (`#mytag`), wikilinks (`[[page]]`), tasks (`- [ ] item`), forward links, and backlinks.
- **Open source** — your content stays in plain files; no vendor lock-in.
- **Focused** — it gives you data; it does not own your render pipeline.

## When to Use MarkdownDB

MarkdownDB is a good fit when:

- Records mix rich text with structured metadata — blogs, wikis, personal notes, documentation, digital gardens
- Your collection is up to roughly 10,000 files
- You want to keep content in plain text but query it programmatically
