import DashboardLayout from '@/components/DashboardLayout'
import { Users, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react'
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to DevHub</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Active Users" value="2,543" icon={<Users className="w-6 h-6" />} />
          <Card title="Messages" value="12,891" icon={<MessageSquare className="w-6 h-6" />} />
          <Card title="Growth" value="23.5%" icon={<TrendingUp className="w-6 h-6" />} />
          <Card title="Revenue" value="$45,231" icon={<BarChart3 className="w-6 h-6" />} />
        </div>
      </div>
    </DashboardLayout>
  )
}
function Card({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div><p className="text-slate-600 text-sm">{title}</p><p className="text-2xl font-bold mt-2">{value}</p></div>
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">{icon}</div>
      </div>
    </div>
  )
}
