import AICommitGenerator from '@/components/AICommitGenerator'
import { useState } from 'react'

interface CommitMessage {
  title: string
  body: string
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore'
}

export default function CommitGeneratorPage() {
  const [selectedMessage, setSelectedMessage] = useState<CommitMessage | null>(null)

  const handleMessageSelect = (message: CommitMessage) => {
    setSelectedMessage(message)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI Commit Message Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate meaningful commit messages automatically using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator */}
          <div className="lg:col-span-2">
            <AICommitGenerator onSelectMessage={handleMessageSelect} />
          </div>

          {/* Selected Message Display */}
          {selectedMessage && (
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Message
              </h3>

              <div className="space-y-4">
                {/* Type Badge */}
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                    Type
                  </p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {selectedMessage.type}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase mb-2">
                    Commit Title
                  </p>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm break-words border border-gray-200">
                    {selectedMessage.title}
                  </div>
                </div>

                {/* Body */}
                {selectedMessage.body && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase mb-2">
                      Commit Body
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-sm break-words border border-gray-200">
                      {selectedMessage.body}
                    </div>
                  </div>
                )}

                {/* Full Message */}
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase mb-2">
                    Full Message
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-auto whitespace-pre-wrap max-h-40 border border-gray-700">
                    {selectedMessage.title}
                    {selectedMessage.body && `\n\n${selectedMessage.body}`}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    const fullMessage = `${selectedMessage.title}${selectedMessage.body ? '\n\n' + selectedMessage.body : ''}`
                    navigator.clipboard.writeText(fullMessage)
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            How to use
          </h2>
          <ol className="space-y-2 text-blue-800 list-decimal list-inside">
            <li>Paste your git diff in the textarea (use `git diff` command)</li>
            <li>Optionally add context like a JIRA ticket ID or feature name</li>
            <li>Select your preferred commit style</li>
            <li>Click "Generate Commit Messages"</li>
            <li>Review the suggestions and select the best one</li>
            <li>The selected message appears in the sidebar for easy copying</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
