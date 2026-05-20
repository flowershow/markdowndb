---
title: Data Structures
---

MarkdownDB parses your Markdown files and stores the extracted data in several tables. This page documents every field in each table so you know exactly what comes out of the database when you query it.

## File

Each indexed file is stored as a row in the `files` table. This is the primary object you will work with.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | SHA-1 hash of the file's relative path. Unique identifier. |
| `file_path` | `string` | Absolute path to the file on disk. |
| `extension` | `string` | File extension without the leading dot (e.g. `"md"`, `"mdx"`). |
| `url_path` | `string \| null` | URL-friendly path derived from `file_path`. The `.md`/`.mdx` extension is removed and a trailing `index` segment is stripped. |
| `filetype` | `string \| null` | Value of the `type` field in the file's frontmatter, if present. |
| `metadata` | `object \| null` | All frontmatter fields as a JSON object. |

### Example

Given a Markdown file `blog/hello-world.md`:

```md
---
title: Hello World
date: 2024-01-15
tags: [news, tutorial]
draft: false
---

# Hello World

Welcome to my blog.
```

The resulting `files` record looks like:

```json
{
  "_id": "a3f5c2d1e4b6...",
  "file_path": "/content/blog/hello-world.md",
  "extension": "md",
  "url_path": "blog/hello-world",
  "filetype": null,
  "metadata": {
    "title": "Hello World",
    "date": "2024-01-15",
    "tags": ["news", "tutorial"],
    "draft": false
  }
}
```

> **Computed fields** can add extra top-level properties to this object. See [Computed Fields](computed-fields) for details.

---

## Tag

Unique tags are stored in the `tags` table. Tags are extracted from the frontmatter `tags` array and from inline `#tag` syntax in the body.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The tag string (primary key). |

### Example

```json
{ "name": "tutorial" }
```

---

## FileTag

The `file_tags` table is the many-to-many join between files and tags.

| Field | Type | Description |
|-------|------|-------------|
| `file` | `string` | `_id` of the file (foreign key → `files._id`). |
| `tag` | `string` | Name of the tag (foreign key → `tags.name`). |

### Example

```json
{ "file": "a3f5c2d1e4b6...", "tag": "tutorial" }
```

---

## Link

Every hyperlink (`[text](url)`) and wiki-style link (`[[page]]`) found in a file is stored in the `links` table.

| Field | Type | Description |
|-------|------|-------------|
| `link_type` | `"normal" \| "embed"` | `"normal"` for regular hyperlinks and wiki links; `"embed"` for embedded images or iframes. |
| `from` | `string` | `_id` of the source file (foreign key → `files._id`). |
| `to` | `string` | `_id` of the target file (foreign key → `files._id`). Only links whose target exists in the index are stored. |

### Example

```json
{
  "link_type": "normal",
  "from": "a3f5c2d1e4b6...",
  "to": "b7d9e1f2a3c4..."
}
```

---

## Task

Tasks (`- [ ] …` and `- [x] …` list items) are extracted and stored in the `tasks` table. MarkdownDB also recognizes inline metadata fields in the form `[field:: value]`.

| Field | Type | Description |
|-------|------|-------------|
| `description` | `string` | Full text of the task item. |
| `checked` | `boolean` | `true` if the checkbox is ticked, `false` otherwise. |
| `due` | `string \| null` | Value of the `[due:: …]` inline field, if present. |
| `completion` | `string \| null` | Value of the `[completion:: …]` inline field, if present. |
| `created` | `string \| null` | Value of the `[created:: …]` inline field, if present. |
| `start` | `string \| null` | Value of the `[start:: …]` inline field, if present. |
| `scheduled` | `string \| null` | Value of the `[scheduled:: …]` inline field, if present. |
| `list` | `string \| null` | For Kanban boards: the heading of the list that contains the task, otherwise `null`. |
| `metadata` | `object \| null` | All `[field:: value]` pairs found in the task description, as a JSON object. |

### Example

Given the following Markdown:

```md
- [ ] Write release notes
- [x] Ship feature #done [due:: 2024-06-01] [person:: Alice]
```

The tasks stored are:

```json
[
  {
    "description": "Write release notes",
    "checked": false,
    "due": null,
    "completion": null,
    "created": null,
    "start": null,
    "scheduled": null,
    "list": null,
    "metadata": {}
  },
  {
    "description": "Ship feature #done [due:: 2024-06-01] [person:: Alice]",
    "checked": true,
    "due": "2024-06-01",
    "completion": null,
    "created": null,
    "start": null,
    "scheduled": null,
    "list": null,
    "metadata": {
      "due": "2024-06-01",
      "person": "Alice",
      "tags": ["done"]
    }
  }
]
```

---

## Database schema diagram

```
files ──< file_tags >── tags
  │
  └──< links >── files (self-referential)

files ──< tasks
```

All foreign keys use `CASCADE` on delete, so removing a file automatically cleans up its tags, links, and tasks.
