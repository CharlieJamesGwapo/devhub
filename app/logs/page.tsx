'use client'

import LogsViewer from '@/components/LogsViewer'

export default function LogsPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex-1">
        <LogsViewer />
      </div>
    </div>
  )
}
