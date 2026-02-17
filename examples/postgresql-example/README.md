# Using MarkdownDB with PostgreSQL

This example shows how to use MarkdownDB with PostgreSQL instead of SQLite.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install mddb pg
   ```

2. **Create database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE markdowndb_example;"
   ```

3. **Configure and run:**
   ```js
   import { MarkdownDB } from "mddb";

   const client = new MarkdownDB({
     client: "pg",
     connection: {
       host: "localhost",
       port: 5432,
       user: "postgres",
       password: "your_password",
       database: "markdowndb_example",
     },
   });

   const mddb = await client.init();
   await mddb.indexFolder({ folderPath: "./content" });
   
   const files = await mddb.getFiles();
   console.log(`Indexed ${files.length} files`);
   ```

## Environment Variables

Use `.env` for credentials:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=markdowndb_example
```

Then in your code:
```js
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
```

## Connection String

PostgreSQL also supports connection strings:
```js
const client = new MarkdownDB({
  client: "pg",
  connection: "postgresql://user:password@localhost:5432/markdowndb_example",
});
```

## Why PostgreSQL?

- **Advanced features**: Full-text search, JSON operators, extensions
- **ACID compliance**: Strong data integrity
- **Scalability**: Handles complex queries efficiently
- **JSON support**: Native JSONB type with powerful operators
