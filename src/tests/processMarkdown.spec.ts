import { processMarkdown } from "../lib/processMarkdown";

describe("processMarkdown", () => {
  it("should process markdown string and extract metadata", () => {
    const source = `---
title: Hello World
author: John Doe
tags: [javascript, tutorial]
---

# Hello World

This is a test document.
`;

    const result = processMarkdown(source);

    expect(result.metadata.title).toBe("Hello World");
    expect(result.metadata.author).toBe("John Doe");
    expect(result.metadata.tags).toEqual(["javascript", "tutorial"]);
    expect(result.ast).toBeDefined();
    expect(result.ast.type).toBe("root");
  });

  it("should extract wiki links from markdown", () => {
    const source = `---
title: Test Links
---

# Test Links

This is a [[wiki-link]] and another [[nested/wiki-link]].
`;

    const result = processMarkdown(source);

    expect(result.links).toHaveLength(2);
    expect(result.links[0].to).toBe("wiki-link");
    expect(result.links[0].embed).toBe(false);
    expect(result.links[1].to).toBe("nested/wiki-link");
  });

  it("should extract regular links from markdown", () => {
    const source = `# Test Links

This is a [regular link](./other.md) and [another link](../parent.md).
`;

    const result = processMarkdown(source);

    expect(result.links).toHaveLength(2);
    expect(result.links[0].toRaw).toBe("./other.md");
    expect(result.links[1].toRaw).toBe("../parent.md");
  });

  it("should extract embed links (images)", () => {
    const source = `# Test Images

![[image.png]]
![alt text](./image.jpg)
`;

    const result = processMarkdown(source);

    expect(result.links.length).toBeGreaterThanOrEqual(2);
    const embedLinks = result.links.filter((link) => link.embed);
    expect(embedLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("should extract tags from body", () => {
    const source = `---
title: Test Tags
tags: [frontmatter-tag]
---

# Test Tags

This document has #body-tag and #another-tag in the content.
`;

    const result = processMarkdown(source);

    expect(result.metadata.tags).toContain("frontmatter-tag");
    expect(result.metadata.tags).toContain("body-tag");
    expect(result.metadata.tags).toContain("another-tag");
  });

  it("should extract tasks from markdown", () => {
    const source = `# Tasks

- [ ] Incomplete task
- [x] Complete task
- [ ] Another incomplete task
`;

    const result = processMarkdown(source);

    expect(result.metadata.tasks).toHaveLength(3);
    expect(result.metadata.tasks[0].description).toBe("Incomplete task");
    expect(result.metadata.tasks[0].checked).toBe(false);
    expect(result.metadata.tasks[1].description).toBe("Complete task");
    expect(result.metadata.tasks[1].checked).toBe(true);
  });

  it("should handle markdown without frontmatter", () => {
    const source = `# Simple Document

Just some text without frontmatter.
`;

    const result = processMarkdown(source);

    expect(result.metadata).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(result.links).toEqual([]);
  });

  it("should handle empty string", () => {
    const source = "";

    const result = processMarkdown(source);

    expect(result.metadata).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(result.links).toEqual([]);
  });

  it("should resolve relative links with from option", () => {
    const source = `[link](./other.md)`;

    const result = processMarkdown(source, {
      from: "blog/post.md",
    });

    expect(result.links).toHaveLength(1);
    expect(result.links[0].from).toBe("blog/post.md");
    expect(result.links[0].to).toBe("blog/other.md");
  });

  it("should handle custom remark plugins", () => {
    const source = `# Test`;

    // This test just verifies that the remarkPlugins option is accepted
    const result = processMarkdown(source, {
      remarkPlugins: [],
    });

    expect(result.ast).toBeDefined();
  });

  it("should extract international tags", () => {
    const source = `# International Tags

#日本語タグ
#标签名
#метка
#태그이름
#tag_فارسی
#Tag_avec_éèç-_öäüßñ
`;

    const result = processMarkdown(source);

    expect(result.metadata.tags).toContain("日本語タグ");
    expect(result.metadata.tags).toContain("标签名");
    expect(result.metadata.tags).toContain("метка");
    expect(result.metadata.tags).toContain("태그이름");
    expect(result.metadata.tags).toContain("tag_فارسی");
    expect(result.metadata.tags).toContain("Tag_avec_éèç-_öäüßñ");
  });

  it("should parse Obsidian-style comma-separated tags in frontmatter", () => {
    const source = `---
title: Test
tags: tag1, tag2, tag3
---

# Content
`;

    const result = processMarkdown(source);

    expect(result.metadata.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("should handle tasks with metadata", () => {
    const source = `# Tasks

- [ ] Task with [due:: 2025-12-31] metadata
- [x] Completed [created:: 2025-01-01] task
`;

    const result = processMarkdown(source);

    expect(result.metadata.tasks).toHaveLength(2);
    expect(result.metadata.tasks[0].metadata).toBeDefined();
    expect(result.metadata.tasks[0].due).toBe("2025-12-31");
    expect(result.metadata.tasks[1].created).toBe("2025-01-01");
  });

  it("should return unique tags (no duplicates)", () => {
    const source = `---
tags: [duplicate]
---

# Content

#duplicate #duplicate #other
`;

    const result = processMarkdown(source);

    const duplicateCount = result.metadata.tags.filter(
      (tag) => tag === "duplicate"
    ).length;
    expect(duplicateCount).toBe(1);
  });

  it("should work for CloudFlare Workers use case (string input)", () => {
    // Simulate reading content from a stream/file in CloudFlare Workers
    const markdownContent = `---
title: Edge Function Content
description: Processed at the edge
---

# Edge Content

Processing markdown in serverless environments like CloudFlare Workers.

[[related-content]]

- [ ] Do something
`;

    const result = processMarkdown(markdownContent);

    expect(result.metadata.title).toBe("Edge Function Content");
    expect(result.metadata.description).toBe("Processed at the edge");
    expect(result.links.length).toBeGreaterThan(0);
    expect(result.metadata.tasks.length).toBeGreaterThan(0);
    
    // Verify we can serialize the result
    expect(() => JSON.stringify(result.metadata)).not.toThrow();
  });
});
