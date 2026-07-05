import DashboardLayout from '@/components/DashboardLayout'
import K8sViewer from '@/components/K8sViewer'
import { Suspense } from 'react'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-600">Loading Kubernetes resources...</div>
    </div>
  )
}

export default function KubernetesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kubernetes Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage your Kubernetes clusters and deployments</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <K8sViewer />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
