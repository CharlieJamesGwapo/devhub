'use client'
import { Bell, Search, ChevronDown } from 'lucide-react'
export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>
        <div className="flex items-center space-x-6 ml-6">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
            <div className="hidden sm:block"><p className="text-sm font-medium">John Doe</p></div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
