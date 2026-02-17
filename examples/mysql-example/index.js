import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "markdowndb_example",
  },
});

const mddb = await client.init();

await mddb.indexFolder({
  folderPath: process.argv[2] || "./content",
});

const files = await mddb.getFiles();
console.log(`\nIndexed ${files.length} files in MySQL`);

await mddb.db.destroy();
