import DashboardLayout from '@/components/DashboardLayout'
import JSONTools from '@/components/JSONTools'
import JWTTools from '@/components/JWTTools'

export default function ToolsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Developer Tools</h1>
          <p className="text-slate-600 mt-2">Utilities and AI-powered tools for development tasks</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-slate-700"><strong>15 Available Features:</strong></p>
          <ul className="text-slate-700 mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>✓ AI Commit Generator</li>
            <li>✓ AI Code Explainer</li>
            <li>✓ AI Error Analyzer</li>
            <li>✓ AI SQL Generator</li>
            <li>✓ AI Doc Writer</li>
            <li>✓ API Tester</li>
            <li>✓ JWT Tools</li>
            <li>✓ JSON Tools</li>
            <li>✓ Kubernetes Dashboard</li>
            <li>✓ Docker Manager</li>
            <li>✓ Database Explorer</li>
            <li>✓ SQL Playground</li>
            <li>✓ Logs Viewer</li>
            <li>✓ GitHub Dashboard</li>
            <li>✓ Team Collaboration</li>
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Utility Tools</h2>
          <div className="space-y-12">
            <JWTTools />
            <div className="border-t border-slate-200 pt-12">
              <JSONTools />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">AI-Powered Features</h3>
          <p className="text-slate-300 mb-4">Access specialized AI tools through the Tools menu or dedicated pages:</p>
          <ul className="text-slate-300 space-y-2">
            <li>• AI Commit Generator - Generate meaningful commit messages from diffs</li>
            <li>• AI Code Explainer - Understand code with AI explanations</li>
            <li>• AI Error Analyzer - Get AI-powered error analysis and fixes</li>
            <li>• AI SQL Generator - Generate SQL from natural language</li>
            <li>• AI Doc Writer - Auto-generate documentation</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
