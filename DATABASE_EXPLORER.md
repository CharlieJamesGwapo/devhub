# Database Explorer Feature

## Overview
Database Explorer is a full-featured database management tool for DevHub that enables connecting to PostgreSQL and MySQL databases, browsing tables, viewing and editing records, managing relationships, and exporting data to CSV.

## Files Created

### Component
- **`components/DatabaseExplorer.tsx`** - Main React component with full UI and functionality

### API Routes
- **`pages/api/database/connect.ts`** - POST endpoint to test database connection and retrieve table schema
- **`pages/api/database/tables/[tableName].ts`** - GET endpoint to load table data and column information
- **`pages/api/database/records/[tableName].ts`** - POST/PUT endpoints to create and update records
- **`pages/api/database/records/[tableName]/[id].ts`** - PUT/DELETE endpoints to update and delete individual records
- **`pages/api/database/export/[tableName].ts`** - GET endpoint to export table data as CSV

### Utilities
- **`lib/database.ts`** - Database abstraction layer supporting PostgreSQL and MySQL

### Page
- **`app/database/page.tsx`** - Next.js page that renders the DatabaseExplorer component

## Features

### Connection Management
- Support for PostgreSQL and MySQL
- Connection form with validation
- Host, port, database, username, and password configuration
- Connection status feedback

### Table Browser
- Lists all tables in the database
- Shows row count for each table
- Displays table relationships (foreign keys)
- Column information including types and constraints

### Data Viewing & Editing
- View all records in a table with pagination support
- Edit existing records with validation
- Create new records with automatic form generation
- Delete records with confirmation
- Column type information displayed in headers
- Null value handling

### Relationships
- Display foreign key relationships between tables
- Shows referenced tables and columns
- Helps understand data dependencies

### Export
- Export any table to CSV format
- Includes all columns and rows
- Proper CSV formatting with quoted values
- Automatic file download with timestamp

## Architecture

### Database Layer (`lib/database.ts`)
The database layer provides a unified interface for both PostgreSQL and MySQL operations:

```typescript
// Connection
getTables(config) - Get all tables with schema info
getTableData(config, tableName) - Get table records
getTableColumns(config, tableName) - Get column details

// CRUD Operations
insertRecord(config, tableName, data)
updateRecord(config, tableName, id, data)
deleteRecord(config, tableName, id)

// Export
exportTableCSV(config, tableName)
```

### API Routes
All API routes follow RESTful conventions and accept connection configuration in the request.

### Frontend Component
The DatabaseExplorer component manages:
- Connection state
- Table selection
- Record editing
- Data display
- Export functionality

## Dependencies
- `pg` - PostgreSQL driver
- `mysql2` - MySQL driver
- React 18.2.0
- Next.js 14.0.0
- TypeScript

Install dependencies:
```bash
npm install --legacy-peer-deps
```

## Usage

### Access the Feature
Navigate to `/database` in your DevHub application.

### Connect to Database
1. Select your database provider (PostgreSQL or MySQL)
2. Enter connection details:
   - Host (e.g., localhost)
   - Port (5432 for PostgreSQL, 3306 for MySQL)
   - Database name
   - Username
   - Password
3. Click "Connect"

### Browse Tables
- View all available tables in the left sidebar
- Click any table to load its data
- See row count and column information

### View & Edit Records
- Click "Edit" on any row to modify its data
- Click "New Record" to add a new record
- Fill in the form fields (required fields marked with *)
- Primary key fields are auto-detected and protected
- Click "Save" to persist changes

### Delete Records
- Click "Delete" on a row to remove it
- Confirm deletion when prompted

### Export Data
- Click "Export CSV" to download table data
- File includes all columns and rows
- Downloaded with table name and current date

## Type Definitions

```typescript
interface ConnectionConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  provider: 'postgresql' | 'mysql'
}

interface Table {
  name: string
  rowCount: number
  columns: Column[]
  foreignKeys: ForeignKey[]
}

interface Column {
  name: string
  type: string
  isNullable: boolean
  isPrimaryKey: boolean
  isAutoIncrement: boolean
}

interface ForeignKey {
  column: string
  referencedTable: string
  referencedColumn: string
}
```

## Error Handling
- Connection failures are reported with specific error messages
- Database operation errors are caught and displayed in the UI
- Validation prevents invalid operations
- Network errors are handled gracefully

## Security Considerations
- Connection credentials are passed through request bodies
- No credentials are stored client-side
- SQL injection is prevented using parameterized queries
- Read-only table schema queries
- Edit and delete operations require explicit confirmation

## Styling
- Uses TailwindCSS for responsive design
- Consistent with existing DevHub design
- Dark gray and blue color scheme
- Mobile-responsive layout
- Sticky headers for easy scrolling

## Future Enhancements
- Advanced filtering and search
- Record pagination
- Stored procedure support
- Multi-table queries
- Data validation rules
- Bulk operations
- Query history
- Database backup/restore
- User permissions and auditing

## Troubleshooting

### Connection Failed
- Verify database host and port are correct
- Check username and password
- Ensure database exists
- Verify network connectivity to database server

### No Tables Shown
- Confirm user has permissions to view table schema
- Database may be empty
- Try refreshing the connection

### Edit/Delete Not Working
- Check database user has INSERT/UPDATE/DELETE permissions
- Verify table has an 'id' column
- Connection may have been lost
