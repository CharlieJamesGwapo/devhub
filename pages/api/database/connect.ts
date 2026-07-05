import { NextApiRequest, NextApiResponse } from 'next'
import { getTables, ConnectionConfig } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const config: ConnectionConfig = req.body

    if (!config.host || !config.database || !config.user) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const tables = await getTables(config)

    return res.status(200).json({ tables })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed'
    return res.status(500).json({ error: message })
  }
}
