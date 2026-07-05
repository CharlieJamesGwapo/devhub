import { Pool, QueryResult } from 'pg'
import * as mysql from 'mysql2/promise'

export interface ConnectionConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  provider: 'postgresql' | 'mysql'
}

export interface Column {
  name: string
  type: string
  isNullable: boolean
  isPrimaryKey: boolean
  isAutoIncrement: boolean
}

export interface ForeignKey {
  column: string
  referencedTable: string
  referencedColumn: string
}

export interface Table {
  name: string
  rowCount: number
  columns: Column[]
  foreignKeys: ForeignKey[]
}

// PostgreSQL Helper Functions
async function getPostgresConnection(config: ConnectionConfig) {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
  })
  return pool
}

async function getPostgresTables(config: ConnectionConfig): Promise<Table[]> {
  const pool = await getPostgresConnection(config)
  try {
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const tables: Table[] = []

    for (const row of tablesResult.rows) {
      const tableName = row.table_name

      // Get columns
      const columnsResult = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName])

      const columns: Column[] = columnsResult.rows.map((col: any) => ({
        name: col.column_name,
        type: col.data_type,
        isNullable: col.is_nullable === 'YES',
        isPrimaryKey: false,
        isAutoIncrement: col.column_default?.includes('nextval') || false,
      }))

      // Get primary keys
      const pkResult = await pool.query(`
        SELECT column_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = $1 AND constraint_name = (
          SELECT constraint_name FROM information_schema.table_constraints
          WHERE table_name = $1 AND constraint_type = 'PRIMARY KEY'
        )
      `, [tableName])

      const pkNames = pkResult.rows.map((r: any) => r.column_name)
      columns.forEach((col) => {
        if (pkNames.includes(col.name)) col.isPrimaryKey = true
      })

      // Get foreign keys
      const fkResult = await pool.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.key_column_usage AS kcu
        JOIN information_schema.constraint_column_usage AS ccu
          ON kcu.constraint_name = ccu.constraint_name
        WHERE kcu.table_name = $1 AND kcu.constraint_name IN (
          SELECT constraint_name FROM information_schema.table_constraints
          WHERE table_name = $1 AND constraint_type = 'FOREIGN KEY'
        )
      `, [tableName])

      const foreignKeys = fkResult.rows.map((row: any) => ({
        column: row.column_name,
        referencedTable: row.referenced_table,
        referencedColumn: row.referenced_column,
      }))

      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      const rowCount = countResult.rows[0].count

      tables.push({
        name: tableName,
        rowCount,
        columns,
        foreignKeys,
      })
    }

    return tables
  } finally {
    await pool.end()
  }
}

async function getPostgresTableData(
  config: ConnectionConfig,
  tableName: string,
  limit = 100
) {
  const pool = await getPostgresConnection(config)
  try {
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName])

    const columns: Column[] = columnsResult.rows.map((col: any) => ({
      name: col.column_name,
      type: col.data_type,
      isNullable: col.is_nullable === 'YES',
      isPrimaryKey: false,
      isAutoIncrement: false,
    }))

    const dataResult = await pool.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit])

    return {
      data: dataResult.rows,
      columns,
    }
  } finally {
    await pool.end()
  }
}

async function insertPostgresRecord(
  config: ConnectionConfig,
  tableName: string,
  data: Record<string, any>
) {
  const pool = await getPostgresConnection(config)
  try {
    const keys = Object.keys(data).filter((k) => data[k] !== '')
    const values = keys.map((k) => data[k])
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',')

    const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`
    await pool.query(query, values)
  } finally {
    await pool.end()
  }
}

async function updatePostgresRecord(
  config: ConnectionConfig,
  tableName: string,
  id: any,
  data: Record<string, any>
) {
  const pool = await getPostgresConnection(config)
  try {
    const keys = Object.keys(data).filter((k) => k !== 'id' && data[k] !== '')
    const values = keys.map((k) => data[k])
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',')

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1}`
    await pool.query(query, [...values, id])
  } finally {
    await pool.end()
  }
}

async function deletePostgresRecord(
  config: ConnectionConfig,
  tableName: string,
  id: any
) {
  const pool = await getPostgresConnection(config)
  try {
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id])
  } finally {
    await pool.end()
  }
}

async function exportPostgresTableCSV(config: ConnectionConfig, tableName: string) {
  const pool = await getPostgresConnection(config)
  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`)

    if (result.rows.length === 0) {
      return ''
    }

    const headers = Object.keys(result.rows[0])
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...result.rows.map((row) =>
        headers
          .map((h) => {
            const value = row[h]
            if (value === null) return ''
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(',')
      ),
    ].join('\n')

    return csv
  } finally {
    await pool.end()
  }
}

// MySQL Helper Functions
async function getMySQLConnection(config: ConnectionConfig) {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
  })
  return connection
}

async function getMySQLTables(config: ConnectionConfig): Promise<Table[]> {
  const connection = await getMySQLConnection(config)
  try {
    const [tables] = await connection.query<any[]>(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    )

    const result: Table[] = []

    for (const row of tables) {
      const tableName = row.TABLE_NAME

      const [columns] = await connection.query<any[]>(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, EXTRA, COLUMN_KEY
         FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?`,
        [tableName, config.database]
      )

      const columnList: Column[] = columns.map((col) => ({
        name: col.COLUMN_NAME,
        type: col.COLUMN_TYPE,
        isNullable: col.IS_NULLABLE === 'YES',
        isPrimaryKey: col.COLUMN_KEY === 'PRI',
        isAutoIncrement: col.EXTRA.includes('auto_increment'),
      }))

      const [fkRows] = await connection.query<any[]>(
        `SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [tableName, config.database]
      )

      const foreignKeys = fkRows.map((row) => ({
        column: row.COLUMN_NAME,
        referencedTable: row.REFERENCED_TABLE_NAME,
        referencedColumn: row.REFERENCED_COLUMN_NAME,
      }))

      const [countRows] = await connection.query<any[]>(`SELECT COUNT(*) as count FROM ${tableName}`)
      const rowCount = countRows[0].count

      result.push({
        name: tableName,
        rowCount,
        columns: columnList,
        foreignKeys,
      })
    }

    return result
  } finally {
    await connection.end()
  }
}

async function getMySQLTableData(config: ConnectionConfig, tableName: string, limit = 100) {
  const connection = await getMySQLConnection(config)
  try {
    const [columns] = await connection.query<any[]>(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?`,
      [tableName, config.database]
    )

    const columnList: Column[] = columns.map((col) => ({
      name: col.COLUMN_NAME,
      type: col.COLUMN_TYPE,
      isNullable: col.IS_NULLABLE === 'YES',
      isPrimaryKey: false,
      isAutoIncrement: false,
    }))

    const [data] = await connection.query(`SELECT * FROM ${tableName} LIMIT ?`, [limit])

    return {
      data: data as any[],
      columns: columnList,
    }
  } finally {
    await connection.end()
  }
}

async function insertMySQLRecord(config: ConnectionConfig, tableName: string, data: Record<string, any>) {
  const connection = await getMySQLConnection(config)
  try {
    const keys = Object.keys(data).filter((k) => data[k] !== '')
    const values = keys.map((k) => data[k])

    const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`
    await connection.query(query, values)
  } finally {
    await connection.end()
  }
}

async function updateMySQLRecord(
  config: ConnectionConfig,
  tableName: string,
  id: any,
  data: Record<string, any>
) {
  const connection = await getMySQLConnection(config)
  try {
    const keys = Object.keys(data).filter((k) => k !== 'id' && data[k] !== '')
    const values = keys.map((k) => data[k])

    const setClause = keys.map((k) => `${k} = ?`).join(',')
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`
    await connection.query(query, [...values, id])
  } finally {
    await connection.end()
  }
}

async function deleteMySQLRecord(config: ConnectionConfig, tableName: string, id: any) {
  const connection = await getMySQLConnection(config)
  try {
    await connection.query(`DELETE FROM ${tableName} WHERE id = ?`, [id])
  } finally {
    await connection.end()
  }
}

async function exportMySQLTableCSV(config: ConnectionConfig, tableName: string) {
  const connection = await getMySQLConnection(config)
  try {
    const [rows] = await connection.query(`SELECT * FROM ${tableName}`)

    if ((rows as any[]).length === 0) {
      return ''
    }

    const headers = Object.keys((rows as any[])[0])
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...(rows as any[]).map((row) =>
        headers
          .map((h) => {
            const value = row[h as keyof typeof row]
            if (value === null) return ''
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(',')
      ),
    ].join('\n')

    return csv
  } finally {
    await connection.end()
  }
}

// Unified Interface
export async function getTables(config: ConnectionConfig): Promise<Table[]> {
  if (config.provider === 'postgresql') {
    return getPostgresTables(config)
  } else {
    return getMySQLTables(config)
  }
}

export async function getTableData(config: ConnectionConfig, tableName: string) {
  if (config.provider === 'postgresql') {
    return getPostgresTableData(config, tableName)
  } else {
    return getMySQLTableData(config, tableName)
  }
}

export async function insertRecord(config: ConnectionConfig, tableName: string, data: Record<string, any>) {
  if (config.provider === 'postgresql') {
    return insertPostgresRecord(config, tableName, data)
  } else {
    return insertMySQLRecord(config, tableName, data)
  }
}

export async function updateRecord(
  config: ConnectionConfig,
  tableName: string,
  id: any,
  data: Record<string, any>
) {
  if (config.provider === 'postgresql') {
    return updatePostgresRecord(config, tableName, id, data)
  } else {
    return updateMySQLRecord(config, tableName, id, data)
  }
}

export async function deleteRecord(config: ConnectionConfig, tableName: string, id: any) {
  if (config.provider === 'postgresql') {
    return deletePostgresRecord(config, tableName, id)
  } else {
    return deleteMySQLRecord(config, tableName, id)
  }
}

export async function exportTableCSV(config: ConnectionConfig, tableName: string) {
  if (config.provider === 'postgresql') {
    return exportPostgresTableCSV(config, tableName)
  } else {
    return exportMySQLTableCSV(config, tableName)
  }
}
