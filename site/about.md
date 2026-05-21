---
title: About MarkdownDB
---

# About MarkdownDB

MarkdownDB is a JavaScript library that turns a folder of markdown files into a queryable database. It extracts structured data — frontmatter, tags, links, tasks — indexes it into SQLite, and gives you a clean API to query across your content.

Your files stay as plain text. You get the power of a database.

## Why it exists

Most content lives in one of two places: a CMS (structured and queryable, but locked in a platform) or plain markdown files (free and portable, but unqueryable). That's a false choice.

Markdown files already contain structured data. Frontmatter fields, inline tags, links between pages, tasks — it's all there, sitting unused. MarkdownDB extracts it, indexes it, and makes it queryable.

The underlying idea has a name: the [Markdown Database Pattern](https://markdownisawesome.com/markdown-database). MarkdownDB is its implementation in JavaScript.

## What makes it different

Other tools in this space — Contentlayer, Nuxt Content, Astro content collections — mix content indexing with rendering and tie you to a particular framework. MarkdownDB does one thing: build the index and provide the API. What you do with the data is up to you.

- **Stack-agnostic** — works with any JavaScript framework, or none at all
- **SQL-native** — standard SQL on a real SQLite database, no custom query language
- **Focused** — does not own your render pipeline
- **Extracts more than frontmatter** — inline tags, wikilinks, backlinks, tasks
- **Open source** — MIT licensed, your content never locked in

## The vision

We believe content should be owned, open, and durable.

Markdown is the closest thing the web has to a universal content format — plain text, readable without tools, writable in anything, storable in git. But choosing markdown has always meant giving up queryability. MarkdownDB closes that gap.

The goal is a world where you never have to choose between the freedom of plain text and the power of structured data.

## Built by Flowershow

MarkdownDB is built and maintained by [Flowershow](https://flowershow.app), a team working on markdown-native tools for publishing and managing content. It is open source and contributions are welcome on [GitHub](https://github.com/flowershow/markdowndb).
