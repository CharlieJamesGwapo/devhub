'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Home, MessageSquare, Users, Settings } from 'lucide-react'
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
      <nav className="flex-1 p-4 space-y-2">
        <NavLink href="/dashboard" icon={<Home size={20} />} label="Dashboard" isOpen={isOpen} />
        <NavLink href="/messages" icon={<MessageSquare size={20} />} label="Messages" isOpen={isOpen} />
        <NavLink href="/team" icon={<Users size={20} />} label="Team" isOpen={isOpen} />
        <NavLink href="/settings" icon={<Settings size={20} />} label="Settings" isOpen={isOpen} />
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">U</div>
          {isOpen && <p className="text-sm truncate">User</p>}
        </div>
      </div>
    </aside>
  )
}
function NavLink({ href, icon, label, isOpen }: any) {
  return (
    <Link href={href} className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800">
      {icon}{isOpen && <span className="text-sm">{label}</span>}
    </Link>
  )
}
