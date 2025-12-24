# Using MarkdownDB with PostgreSQL

This example demonstrates how to use MarkdownDB with a PostgreSQL database instead of SQLite.

## Prerequisites

- PostgreSQL server installed and running
- Node.js installed

## Step 1: Install dependencies

First, install the required packages:

```bash
npm install mddb pg
```

The `pg` package is the PostgreSQL driver for Node.js that MarkdownDB uses via Knex.js.

## Step 2: Set up PostgreSQL database

Create a new PostgreSQL database for your markdown content:

```sql
CREATE DATABASE markdowndb_example ENCODING 'UTF8';
```

You can run this command in your PostgreSQL client (psql) or from the command line:

```bash
psql -U postgres -c "CREATE DATABASE markdowndb_example ENCODING 'UTF8';"
```

## Step 3: Configure MarkdownDB to use PostgreSQL

Create an `index.js` file with the following configuration:

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

// Index your markdown files
await mddb.indexFolder({
  folderPath: "./content", // Path to your markdown files
});

// Query the database
const files = await mddb.getFiles();
console.log(`Indexed ${files.length} files`);
console.log(JSON.stringify(files, null, 2));

// Clean up
await mddb.db.destroy();
process.exit(0);
```

Make sure to:
- Update the `user` and `password` with your PostgreSQL credentials
- Update `folderPath` to point to your markdown content directory
- Add `"type": "module"` to your `package.json` to enable ES modules

## Step 4: Run the script

```bash
node index.js
```

The script will:
1. Connect to your PostgreSQL database
2. Create the necessary tables (files, tags, links, tasks)
3. Index all markdown files in the specified folder
4. Query and display the indexed files

## Benefits of using PostgreSQL

- **Advanced features**: Full-text search, JSON operators, array types, and more
- **ACID compliance**: Strong data integrity and reliability
- **Scalability**: Handles large datasets and complex queries efficiently
- **JSON support**: Native JSON/JSONB types with powerful query capabilities
- **Extensions**: PostGIS for geographic data, full-text search, and more

## Connection Options

You can customize the PostgreSQL connection with additional options:

```js
const client = new MarkdownDB({
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "your_password",
    database: "markdowndb_example",
    ssl: false, // Enable for production with proper certificates
  },
  pool: {
    min: 2,
    max: 10,
  },
});
```

## Using Connection Strings

PostgreSQL also supports connection strings:

```js
const client = new MarkdownDB({
  client: "pg",
  connection: "postgresql://user:password@localhost:5432/markdowndb_example",
});
```

## Environment Variables

For production, store your credentials in environment variables:

```js
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
```

Then create a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=markdowndb_example
```

And load it using a package like `dotenv`:

```bash
npm install dotenv
```

```js
import "dotenv/config";
import { MarkdownDB } from "mddb";
// ... rest of your code
```

## PostgreSQL-specific Features

### JSON Queries

PostgreSQL has excellent JSON support. When using PostgreSQL, MarkdownDB automatically uses PostgreSQL's JSON operators (e.g., `metadata->>'key'`) which are more efficient than SQLite's `json_extract`.

### Better Performance

For large datasets, PostgreSQL typically offers better performance than SQLite, especially for:
- Complex queries with multiple joins
- Full-text search
- Concurrent read/write operations

## Troubleshooting

### Connection refused

Make sure PostgreSQL is running:

```bash
# On Linux
sudo systemctl status postgresql

# On Mac with Homebrew
brew services list
```

### Authentication issues

If you get authentication errors, check your `pg_hba.conf` file or create a new user:

```sql
CREATE USER mddb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE markdowndb_example TO mddb_user;
```

### Permission errors

Make sure your user has the necessary permissions:

```sql
-- Connect to the database first
\c markdowndb_example

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO mddb_user;
```

### SSL connection issues

For local development, you can disable SSL:

```js
connection: {
  // ... other options
  ssl: false,
}
```

For production with SSL:

```js
connection: {
  // ... other options
  ssl: {
    rejectUnauthorized: false, // Only for development
    // ca: fs.readFileSync('/path/to/ca-cert.pem').toString(),
  },
}
```
