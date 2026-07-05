import Sidebar from './Sidebar'
import Header from './Header'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto"><div className="p-6">{children}</div></main>
      </div>
    </div>
  )
}
