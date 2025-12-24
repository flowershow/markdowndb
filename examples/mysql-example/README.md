# Using MarkdownDB with MySQL

This example demonstrates how to use MarkdownDB with a MySQL database instead of SQLite.

## Prerequisites

- MySQL server installed and running
- Node.js installed

## Step 1: Install dependencies

First, install the required packages:

```bash
npm install mddb mysql2
```

The `mysql2` package is the MySQL driver for Node.js that MarkdownDB uses via Knex.js.

## Step 2: Set up MySQL database

Create a new MySQL database for your markdown content:

```sql
CREATE DATABASE markdowndb_example CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

You can run this command in your MySQL client or from the command line:

```bash
mysql -u root -p -e "CREATE DATABASE markdowndb_example CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Step 3: Configure MarkdownDB to use MySQL

Create an `index.js` file with the following configuration:

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

// Index your markdown files
await mddb.indexFolder({
  folderPath: "./content", // Path to your markdown files
});

// Query the database
const files = await mddb.getFiles();
console.log(`Indexed ${files.length} files`);
console.log(JSON.stringify(files, null, 2));

process.exit(0);
```

Make sure to:
- Update the `user` and `password` with your MySQL credentials
- Update `folderPath` to point to your markdown content directory
- Add `"type": "module"` to your `package.json` to enable ES modules

## Step 4: Run the script

```bash
node index.js
```

The script will:
1. Connect to your MySQL database
2. Create the necessary tables (files, tags, links, tasks)
3. Index all markdown files in the specified folder
4. Query and display the indexed files

## Benefits of using MySQL

- **Scalability**: MySQL can handle larger datasets and more concurrent connections
- **Remote access**: You can access the database from multiple applications or servers
- **Advanced features**: Replication, clustering, and enterprise features
- **Familiarity**: Many developers and teams are already familiar with MySQL

## Connection Options

You can customize the MySQL connection with additional options:

```js
const client = new MarkdownDB({
  client: "mysql2",
  connection: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "your_password",
    database: "markdowndb_example",
    charset: "utf8mb4",
  },
  pool: {
    min: 2,
    max: 10,
  },
});
```

## Environment Variables

For production, store your credentials in environment variables:

```js
import { MarkdownDB } from "mddb";

const client = new MarkdownDB({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
```

Then create a `.env` file:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
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

## Troubleshooting

### Connection refused

Make sure MySQL is running:

```bash
# On Linux/Mac
sudo service mysql status

# On Mac with Homebrew
brew services list
```

### Authentication issues

If you get authentication errors, you may need to create a new MySQL user or update the authentication method:

```sql
CREATE USER 'mddb_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON markdowndb_example.* TO 'mddb_user'@'localhost';
FLUSH PRIVILEGES;
```

### Character encoding issues

Make sure your database and tables use UTF-8 encoding to properly handle special characters and emoji:

```sql
ALTER DATABASE markdowndb_example CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
