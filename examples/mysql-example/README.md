# Using MarkdownDB with MySQL

This example shows how to use MarkdownDB with MySQL instead of SQLite.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install mddb mysql2
   ```

2. **Create database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE markdowndb_example;"
   ```

3. **Configure and run:**
   ```js
   import { MarkdownDB } from "mddb";

   const client = new MarkdownDB({
     client: "mysql2",
     connection: {
       host: "localhost",
       port: 3306,
       user: "root",
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
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=markdowndb_example
```

Then in your code:
```js
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
```

## Why MySQL?

- **Scalability**: Handles larger datasets and concurrent connections
- **Remote access**: Multi-server deployments
- **Advanced features**: Replication, clustering, backups
