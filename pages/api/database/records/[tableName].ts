import { NextApiRequest, NextApiResponse } from 'next'
import { insertRecord, updateRecord, deleteRecord, ConnectionConfig } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tableName } = req.query

    if (!tableName || typeof tableName !== 'string') {
      return res.status(400).json({ error: 'Invalid table name' })
    }

    const { config, ...recordData } = req.body

    if (!config) {
      return res.status(400).json({ error: 'Missing database config' })
    }

    if (req.method === 'POST') {
      await insertRecord(config as ConnectionConfig, tableName, recordData)
      return res.status(201).json({ success: true })
    } else if (req.method === 'PUT') {
      const { id } = recordData
      if (!id) {
        return res.status(400).json({ error: 'Missing record id' })
      }
      await updateRecord(config as ConnectionConfig, tableName, id, recordData)
      return res.status(200).json({ success: true })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed'
    return res.status(500).json({ error: message })
  }
}
