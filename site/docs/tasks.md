---
title: Tasks extraction
---

MarkdownDB supports task extraction (i.e. `- [ ] this is a task`).

## Tasks Extraction

One of the key features of MarkdownDB is the ability to extract tasks from your Markdown files and store them in the database. Tasks in Markdown files are represented using checkboxes, and MarkdownDB converts them into a structured format in the resulting JSON data or SQL.

### Example

Consider the following Markdown content:

```markdown
---
title: tasks demo
---

- [ ] task not completed
- [X] task completed
```

MarkdownDB will convert this content into the following JSON format:

```js
{
  ...
  "metadata": {
    "title": "tasks demo",
    "tasks": [
      { "description": "task not completed", "checked": false },
      { "description": "task completed", "checked": true }
    ]
  }
}
```

In this example, each task is represented as an object with a `description` and a `checked` property. The `description` holds the task text, and the `checked` property indicates whether the task is completed (`true`) or not (`false`).

### Integration with MarkdownDB

When you index a folder of Markdown files using MarkdownDB, the tasks are automatically extracted and included in the resulting JSON data and SQL database. This makes it easy to query, analyze, and manipulate tasks within your Markdown content.

## Querying Tasks

MarkdownDB provides a flexible querying system that allows you to filter, sort, and analyze your tasks. You can use SQL queries to interact with the database and retrieve specific task information based on your criteria.

### Example Query

To retrieve all tasks, you can use the following SQL query:

```sql
SELECT metadata FROM files;
```

This will return a string that when converted to JSON (using `JSON.parse()`) will yield the tasks in (`metadata.tasks`).
