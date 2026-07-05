import { NextApiRequest, NextApiResponse } from 'next'
import { updateRecord, deleteRecord, ConnectionConfig } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tableName, id } = req.query

    if (!tableName || typeof tableName !== 'string' || !id) {
      return res.status(400).json({ error: 'Invalid table name or id' })
    }

    const { config, ...recordData } = req.body

    if (!config && (req.method === 'PUT' || req.method === 'DELETE')) {
      return res.status(400).json({ error: 'Missing database config' })
    }

    if (req.method === 'PUT') {
      await updateRecord(config as ConnectionConfig, tableName, id, { ...recordData, id })
      return res.status(200).json({ success: true })
    } else if (req.method === 'DELETE') {
      await deleteRecord(config as ConnectionConfig, tableName, id)
      return res.status(200).json({ success: true })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed'
    return res.status(500).json({ error: message })
  }
}
