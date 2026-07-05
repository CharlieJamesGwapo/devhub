import DashboardLayout from '@/components/DashboardLayout'
import SQLPlayground from '@/components/SQLPlayground'

export default function SQLPlaygroundPage() {
  return (
    <DashboardLayout>
      <div className="h-full">
        <SQLPlayground />
      </div>
    </DashboardLayout>
  )
}
