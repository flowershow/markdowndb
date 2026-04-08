---
title: Tags extraction
---

Frontmatter is metadata at the beginning of a Markdown file, often enclosed by triple dashes (`---`). MarkdownDB supports the extraction of frontmatter for further use. Here is an example of a Markdown file with frontmatter:

```md
---
title: Introduction to Frontmatter
author: John Doe
date: 2023-01-15
tags: markdown, frontmatter
---
```

When MarkdownDB processes a file with frontmatter, it extracts the metadata and includes it in the resulting SQL database. The extracted frontmatter for the above example would look like this in JSON format:

```json
{
  ...
  "metadata": {
    ...
    "frontmatter": {
      "title": "Introduction to Frontmatter",
      "author": "John Doe",
      "date": "2023-01-15",
      "tags": ["markdown", "frontmatter"]
    }
  },
  ...
}
```

In the resulting JSON/SQL metadata, each field from the frontmatter is stored with its corresponding value.
