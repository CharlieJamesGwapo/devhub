import Link from 'next/link'
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">DevHub</h1>
        <p className="text-xl text-slate-300 mb-8">Developer collaboration platform</p>
        <Link href="/dashboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold inline-block">
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}
