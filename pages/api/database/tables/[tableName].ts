import { NextApiRequest, NextApiResponse } from 'next'
import { getTableData, ConnectionConfig } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tableName } = req.query
    const config: ConnectionConfig = JSON.parse(req.query.config as string)

    if (!tableName || typeof tableName !== 'string') {
      return res.status(400).json({ error: 'Invalid table name' })
    }

    const { data, columns } = await getTableData(config, tableName)

    return res.status(200).json({ data, columns })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load table data'
    return res.status(500).json({ error: message })
  }
}
