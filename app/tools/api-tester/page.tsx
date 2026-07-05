import DashboardLayout from '@/components/DashboardLayout'
import APITester from '@/components/APITester'

export default function APITesterPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">API Tester</h1>
          <p className="text-slate-600 mt-2">Send HTTP requests and debug your APIs</p>
        </div>
        <APITester />
      </div>
    </DashboardLayout>
  )
}
