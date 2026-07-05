import DashboardLayout from '@/components/DashboardLayout'
import DockerManager from '@/components/DockerManager'
import { Suspense } from 'react'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-600">Loading Docker containers...</div>
    </div>
  )
}

export default function DockerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Docker Manager</h1>
          <p className="text-slate-600 mt-2">Manage your Docker containers and images</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <DockerManager />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
