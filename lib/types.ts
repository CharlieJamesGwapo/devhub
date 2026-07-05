// SQL Playground Types

export interface QueryResult {
  columns: string[]
  rows: Record<string, any>[]
  executionTime: number
}

export interface SavedQuery {
  id: string
  name: string
  query: string
  savedAt: string
}

export interface QueryHistoryItem {
  id: string
  query: string
  timestamp: string
}

export interface QueryResponse {
  columns: string[]
  rows: Record<string, any>[]
  success: boolean
  error?: string
}

export interface QueryRequest {
  query: string
}
