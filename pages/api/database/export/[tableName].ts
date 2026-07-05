import { NextApiRequest, NextApiResponse } from 'next'
import { exportTableCSV, ConnectionConfig } from '@/lib/database'

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

    const csv = await exportTableCSV(config, tableName)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`)
    return res.status(200).send(csv)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed'
    return res.status(500).json({ error: message })
  }
}
