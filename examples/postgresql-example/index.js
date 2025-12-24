import { MarkdownDB } from "mddb";

// PostgreSQL configuration
const client = new MarkdownDB({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "markdowndb_example",
  },
});

const mddb = await client.init();

// Index markdown files
await mddb.indexFolder({
  folderPath: process.argv[2] || "./content",
});

// Query and display indexed files
const files = await mddb.getFiles();
console.log(`\nIndexed ${files.length} files in PostgreSQL database`);
console.log(JSON.stringify(files, null, 2));

// Clean up
await mddb.db.destroy();
process.exit(0);
