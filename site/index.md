---
title: MarkdownDB
layout: plain
---

<div class="mx-auto max-w-7xl px-6 lg:px-8">
  <div class="mx-auto py-16 sm:py-24 lg:py-28 flex flex-col lg:flex-row lg:items-center lg:gap-x-12">
    <div class="flex-1 max-w-xl">
      <h1 class="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl dark:text-white">A rich API to your markdown files in seconds.</h1>
      <p class="mt-6 text-pretty text-lg font-medium text-gray-600 sm:text-xl/8 dark:text-gray-400">An open JS library to turn markdown files into structured, queryable data (SQL and JSON). Build rich markdown-powered sites fast and reliably.</p>
      <div class="mt-8 flex items-center gap-x-6">
        <a href="#quick-start" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">Quick start</a>
        <a href="https://github.com/datopian/markdowndb" class="text-sm/6 font-semibold text-gray-900 dark:text-white">Star on GitHub <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <div class="mt-10 lg:mt-0 flex-1">
      <div class="relative w-full overflow-hidden rounded-xl shadow-xl" style="padding-bottom: 56.25%">
        <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/VwMYABHEGhw?si=VyEjQ5eci8yhzFeu" title="MarkdownDB demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</div>

<!-- Features / Advantages -->

<div class="mx-auto max-w-6xl py-16 px-6 lg:px-8" id="features">
  <div class="text-center">
    <p class="text-base font-semibold text-indigo-600">Features</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Key Advantages of MarkdownDB</h2>
  </div>
  <dl class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Power of plain text:</dt>
      <dd class="inline text-gray-600"> Combination of unstructured content and structured data in simple Markdown files.</dd>
    </div>
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Simplicity at core:</dt>
      <dd class="inline text-gray-600"> Turn your Markdown files into a queryable, lightweight SQL database.</dd>
    </div>
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Flexible and extendable:</dt>
      <dd class="inline text-gray-600"> Bring your own document types, extend your frontmatter with computed fields and check for errors with custom validations.</dd>
    </div>
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Simple API:</dt>
      <dd class="inline text-gray-600"> Get a list of all or some Markdown files, filter them by frontmatter fields, and more.</dd>
    </div>
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Do one thing well:</dt>
      <dd class="inline text-gray-600"> MarkdownDB just gives you a database and an API &mdash; a super-powerful and extensible way to create those from markdown.</dd>
    </div>
    <div class="relative pl-9">
      <dt class="inline font-semibold text-gray-900">Open source:</dt>
      <dd class="inline text-gray-600"> Your content isn't locked away in proprietary platforms. It's open, it's free, it's yours.</dd>
    </div>
  </dl>
</div>

<!-- Key Features with code examples -->

<div class="mx-auto max-w-6xl py-16 px-6 lg:px-8">
  <div class="text-center">
    <p class="text-base font-semibold text-indigo-600">Features</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Key Features of MarkdownDB</h2>
  </div>
  <div class="pt-6 space-y-16">

  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-x-8">
    <div class="lg:w-1/3">
      <h3 class="text-lg font-medium text-gray-900">Task extraction</h3>
      <p class="mt-2 text-sm text-gray-500">Extract tasks from markdown files easily.</p>
    </div>
    <div class="lg:w-2/3">

```markdown
- [x] do laundry
```

```json
{
  "metadata": {
    "tasks": [{ "description": "do laundry", "checked": true }]
  }
}
```

  </div>
  </div>

  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-x-8">
    <div class="lg:w-1/3">
      <h3 class="text-lg font-medium text-gray-900">Frontmatter fields extraction</h3>
      <p class="mt-2 text-sm text-gray-500">Extract structured markdown data from your markdown frontmatter.</p>
    </div>
    <div class="lg:w-2/3">

```markdown
---
title: Example Post
date: 2023-01-01
---

# Content
```

```json
{
  "metadata": {
    "title": "Example Post",
    "date": "2023-01-01"
  }
}
```

  </div>
  </div>

  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-x-8">
    <div class="lg:w-1/3">
      <h3 class="text-lg font-medium text-gray-900">Tags extraction</h3>
      <p class="mt-2 text-sm text-gray-500">Extract tags from markdown body and from <code>tags</code> frontmatter field.</p>
    </div>
    <div class="lg:w-2/3">

```markdown
---
tags: frontmatter_tag_1, frontmatter_tag_2
---
# Some heading
#body_tag

Lorem ipsum #tag1 #tag2 #tag3
```

```json
{
  "metadata": {
    "tags": ["frontmatter_tag_1", "frontmatter_tag_2"]
  },
  "tags": ["body_tag", "frontmatter_tag_1", "frontmatter_tag_2"]
}
```

  </div>
  </div>

  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-x-8">
    <div class="lg:w-1/3">
      <h3 class="text-lg font-medium text-gray-900">Computed Fields</h3>
      <p class="mt-2 text-sm text-gray-500">Compute additional metadata fields on the fly with custom functions.</p>
    </div>
    <div class="lg:w-2/3">

```js
const addTitle = (fileInfo, ast) => {
  const headerNode = ast.children.find((node) => node.type === "heading");
  const title = headerNode
    ? headerNode.children.map((child) => child.value).join("")
    : "";
  fileInfo.title = title;
};

client.indexFolder({
  folderPath: "PATH_TO_FOLDER",
  customConfig: { computedFields: [addTitle] },
});
```

  </div>
  </div>

  </div>
</div>

<!-- Vision -->

<div class="mx-auto max-w-6xl py-16 px-6 lg:px-8">
  <div class="text-center max-w-3xl mx-auto">
    <p class="text-base font-semibold text-indigo-600">Our vision</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Unified Content Management</h2>
    <p class="mt-6 text-lg leading-8 text-gray-600">
      Imagine a world where Markdown isn't just text &ndash; it's a source of structured and unstructured data. With MarkdownDB, we aim to balance the simplicity and accessibility of writing in Markdown with the <strong>ability to query your collection of markdown files like a database</strong> &ndash; think get me all files "with type Blog" or "all documents created in the last week" or "all documents with 'hello world' in the title" or find "all tasks (i.e. <code>- [ ]</code>) in all documents".
    </p>
  </div>
</div>

<!-- Quick Start -->

<div class="mx-auto max-w-6xl py-16 px-6 lg:px-8" id="quick-start">
  <div class="text-center">
    <p class="text-base font-semibold text-indigo-600">Quickstart</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Start using MarkdownDB in just a few steps</h2>
  </div>
  <div class="pt-6 space-y-16">

  <div class="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
    <div class="mt-6 lg:col-span-5 lg:mt-0">
      <h3 class="text-lg font-medium text-gray-900">Step 1: You have a folder of markdown content</h3>
      <p class="mt-2 text-sm text-gray-500">For example, your blog posts. Each file can have a YAML frontmatter header with metadata like title, date, tags, etc.</p>
    </div>
    <div class="flex-auto lg:col-span-7">

```markdown
---
title: My first blog post
date: 2021-01-01
tags: [a, b, c]
author: John Doe
---

# My first blog post

This is my first blog post.
I'm using MarkdownDB to manage my blog posts.
```

  </div>
  </div>

  <div class="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
    <div class="mt-6 lg:col-span-5 lg:mt-0">
      <h3 class="text-lg font-medium text-gray-900">Step 2: Index the files with MarkdownDB</h3>
      <p class="mt-2 text-sm text-gray-500">Use the npm <code>mddb</code> package to index Markdown files into an SQLite database. This will create a <code>markdown.db</code> file in the current directory.</p>
    </div>
    <div class="flex-auto lg:col-span-7">

```bash
# npx mddb <path-to-folder-with-your-md-files>
npx mddb ./blog
```

  </div>
  </div>

  <div class="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
    <div class="mt-6 lg:col-span-5 lg:mt-0">
      <h3 class="text-lg font-medium text-gray-900">Step 3: Query your files with SQL...</h3>
      <p class="mt-2 text-sm text-gray-500">E.g. get all the files with tag <code>a</code>.</p>
    </div>
    <div class="flex-auto lg:col-span-7">

```sql
SELECT files.*
FROM files
INNER JOIN file_tags ON files._id = file_tags.file
WHERE file_tags.tag = 'a'
```

  </div>
  </div>

  <div class="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
    <div class="mt-6 lg:col-span-5 lg:mt-0">
      <h3 class="text-lg font-medium text-gray-900">Step 4: ...or using MarkdownDB Node.js API</h3>
      <p class="mt-2 text-sm text-gray-500">Use our Node API to query your data for your blog, wiki, docs, digital garden, or anything you want!</p>
    </div>
    <div class="flex-auto lg:col-span-7">

```js
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "sqlite3",
  connection: { filename: "markdown.db" },
});

const mddb = await client.init();
const blogFiles = await mddb.getFiles({
  frontmatter: { draft: false },
});
```

  </div>
  </div>

  </div>

  <div class="mt-20 flex items-center justify-center">
    <a href="/blog/basic-tutorial" class="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
      Read full tutorial
    </a>
  </div>
</div>

<!-- Roadmap -->

<div class="py-16 px-6 lg:px-8 max-w-3xl mx-auto" id="roadmap">
  <div class="text-center">
    <p class="text-base font-semibold text-indigo-600">Roadmap</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What's new and what's coming</h2>
  </div>
  <div class="pt-6 flex flex-col gap-11">
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Apr 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">MarkdownDB released!</p>
      <p class="mt-1 text-base leading-7 text-gray-600">First version of the package released under <code>@flowershow/markdowndb</code> with basic functionalities, like indexing files into an SQLite database, extracting frontmatter data and basic JS API.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        May 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.1.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">We added support for extracting and querying forward links and backlinks.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Aug 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.2.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">We fixed some annoying bugs and renamed package from <code>@flowershow/markdowndb</code> to just <code>mddb</code>.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Oct 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.3.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">Support for querying files by frontmatter field values.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Nov 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.4.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">Add Tags Extraction from Markdown Content.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Nov 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.5.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">Add tasks extraction from files. e.g <code>- [ ] task</code></p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Dec 2023
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 0.6.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">Implement JSON output to disk.</p>
    </div>
    <div>
      <div class="flex items-center text-sm font-semibold leading-6 text-indigo-600">
        <svg viewBox="0 0 4 4" class="mr-4 h-1 w-1 flex-none" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
        Coming soon...
      </div>
      <p class="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Version 1.0.0</p>
      <p class="mt-1 text-base leading-7 text-gray-600">Support for custom document types and computed fields.</p>
    </div>
  </div>
</div>

<!-- CTA -->

<div class="relative overflow-hidden py-20 px-6 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 mt-16">
  <div class="relative mx-auto max-w-3xl text-center">
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
      Start using MarkdownDB today.
    </h2>
    <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
      Check out our tutorial and learn the basics of using MarkdownDB in the command line and in the Node.js project.
    </p>
    <div class="mt-10 flex items-center justify-center">
      <a href="/blog/basic-tutorial" class="rounded-md bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50">
        Read tutorial
      </a>
    </div>
  </div>
</div>
