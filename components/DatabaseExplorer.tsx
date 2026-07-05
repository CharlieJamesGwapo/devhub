'use client'

import { useState, useEffect } from 'react'

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

interface Record {
  [key: string]: any
}

export default function DatabaseExplorer() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    host: 'localhost',
    port: 5432,
    database: '',
    user: '',
    password: '',
    provider: 'postgresql',
  })

  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<Record[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [showNewRecord, setShowNewRecord] = useState(false)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionConfig),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Connection failed')
      }

      const { tables } = await response.json()
      setTables(tables)
      setConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async (tableName: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/database/tables/${tableName}?config=${encodeURIComponent(JSON.stringify(connectionConfig))}`
      )

      if (!response.ok) {
        throw new Error('Failed to load table data')
      }

      const { data, columns } = await response.json()
      setTableData(data)
      setColumns(columns)
      setSelectedTable(tableName)
      setEditingRecord(null)
      setShowNewRecord(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table data')
    } finally {
      setLoading(false)
    }
  }

  const saveRecord = async () => {
    if (!editingRecord || !selectedTable) return

    setLoading(true)
    setError(null)

    try {
      const isNew = !editingRecord.id
      const response = await fetch(
        `/api/database/records/${selectedTable}${isNew ? '' : `/${editingRecord.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingRecord, config: connectionConfig }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save record')
      }

      await loadTableData(selectedTable)
      setEditingRecord(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record')
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (recordId: any) => {
    if (!selectedTable || !confirm('Are you sure?')) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/database/records/${selectedTable}/${recordId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: connectionConfig }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete record')
      }

      await loadTableData(selectedTable)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    if (!selectedTable) return

    try {
      const response = await fetch(
        `/api/database/export/${selectedTable}?config=${encodeURIComponent(JSON.stringify(connectionConfig))}`
      )

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Database Explorer</h1>
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={connectionConfig.provider}
              onChange={(e) =>
                setConnectionConfig({
                  ...connectionConfig,
                  provider: e.target.value as 'postgresql' | 'mysql',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <input
                type="text"
                value={connectionConfig.host}
                onChange={(e) =>
                  setConnectionConfig({ ...connectionConfig, host: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={connectionConfig.port}
                onChange={(e) =>
                  setConnectionConfig({ ...connectionConfig, port: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
            <input
              type="text"
              value={connectionConfig.database}
              onChange={(e) =>
                setConnectionConfig({ ...connectionConfig, database: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              value={connectionConfig.user}
              onChange={(e) =>
                setConnectionConfig({ ...connectionConfig, user: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={connectionConfig.password}
              onChange={(e) =>
                setConnectionConfig({ ...connectionConfig, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Database Explorer</h1>
        <button
          onClick={() => {
            setConnected(false)
            setSelectedTable(null)
            setTableData([])
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Disconnect
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tables List */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Tables ({tables.length})</h2>
            <div className="space-y-1">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => loadTableData(table.name)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedTable === table.name
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="truncate">{table.name}</div>
                  <div className="text-xs text-gray-500">{table.rowCount} rows</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              {/* Table Header */}
              <div className="bg-white border-b p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedTable}</h2>
                  <p className="text-sm text-gray-600">{columns.length} columns</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewRecord(true)
                      setEditingRecord({})
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    New Record
                  </button>
                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Edit Form */}
              {(editingRecord || showNewRecord) && (
                <div className="bg-blue-50 border-b p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {columns.map((col) => (
                      <div key={col.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {col.name} {col.isPrimaryKey ? '(PK)' : ''} {!col.isNullable ? '*' : ''}
                        </label>
                        <input
                          type="text"
                          value={editingRecord?.[col.name] ?? ''}
                          onChange={(e) =>
                            setEditingRecord({
                              ...editingRecord,
                              [col.name]: e.target.value,
                            })
                          }
                          disabled={col.isPrimaryKey && !showNewRecord}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveRecord}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRecord(null)
                        setShowNewRecord(false)
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="flex-1 overflow-auto p-4">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 w-12">Action</th>
                        {columns.map((col) => (
                          <th
                            key={col.name}
                            className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                          >
                            {col.name}
                            <div className="text-xs text-gray-500 font-normal">{col.type}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((record, idx) => (
                        <tr key={idx} className="border-b hover:bg-blue-50">
                          <td className="px-4 py-2 flex gap-1">
                            <button
                              onClick={() => setEditingRecord(record)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                          {columns.map((col) => (
                            <td key={col.name} className="px-4 py-2 text-gray-700 max-w-xs truncate">
                              {record[col.name] ?? 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No records found</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a table to view data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
