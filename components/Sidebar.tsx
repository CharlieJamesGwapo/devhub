'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Home, MessageSquare, Users, Settings, Wrench, BarChart3, Database, Code, GitBranch, LogsIcon, Zap, BookOpen, Cloud, Monitor } from 'lucide-react'
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all flex flex-col h-screen`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {isOpen && <h1 className="text-xl font-bold">DevHub</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-800 rounded">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mb-2`}>
          {isOpen && 'MAIN'}
        </div>
        <NavLink href="/dashboard" icon={<Home size={20} />} label="Dashboard" isOpen={isOpen} />

        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mt-4 mb-2`}>
          {isOpen && 'AI FEATURES'}
        </div>
        <NavLink href="/tools" icon={<Zap size={20} />} label="AI Tools" isOpen={isOpen} />

        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mt-4 mb-2`}>
          {isOpen && 'INFRASTRUCTURE'}
        </div>
        <NavLink href="/kubernetes" icon={<Cloud size={20} />} label="Kubernetes" isOpen={isOpen} />
        <NavLink href="/docker" icon={<Container size={20} />} label="Docker" isOpen={isOpen} />
        <NavLink href="/deployments" icon={<Monitor size={20} />} label="Deployments" isOpen={isOpen} />

        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mt-4 mb-2`}>
          {isOpen && 'DEVELOPMENT'}
        </div>
        <NavLink href="/database" icon={<Database size={20} />} label="Database" isOpen={isOpen} />
        <NavLink href="/sql-playground" icon={<Code size={20} />} label="SQL Playground" isOpen={isOpen} />
        <NavLink href="/logs" icon={<LogsIcon size={20} />} label="Logs" isOpen={isOpen} />
        <NavLink href="/github-dashboard" icon={<GitBranch size={20} />} label="GitHub" isOpen={isOpen} />

        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mt-4 mb-2`}>
          {isOpen && 'COLLABORATION'}
        </div>
        <NavLink href="/messages" icon={<MessageSquare size={20} />} label="Messages" isOpen={isOpen} />
        <NavLink href="/team" icon={<Users size={20} />} label="Team" isOpen={isOpen} />

        <div className={`${isOpen ? 'px-4 py-2' : 'px-2'} text-xs text-slate-500 font-semibold mt-4 mb-2`}>
          {isOpen && 'SETTINGS'}
        </div>
        <NavLink href="/settings" icon={<Settings size={20} />} label="Settings" isOpen={isOpen} />
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">DH</div>
          {isOpen && <div><p className="text-sm font-semibold">DevHub</p><p className="text-xs text-slate-400">v1.0.0</p></div>}
        </div>
      </div>
    </aside>
  )
}
function NavLink({ href, icon, label, isOpen }: any) {
  return (
    <Link href={href} className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
      {icon}{isOpen && <span className="text-sm">{label}</span>}
    </Link>
  )
}
function Container({ size }: any) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6h20M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path></svg>
}
