'use client'

import { useState } from 'react'

interface DecodedJWT {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  isValid: boolean
  isExpired: boolean
  expirationDate: Date | null
}

export default function JWTTools() {
  const [jwtInput, setJwtInput] = useState<string>('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [error, setError] = useState<string>('')
  const [showDemo, setShowDemo] = useState<boolean>(false)

  // Utility function to decode base64url
  const decodeBase64Url = (str: string): string => {
    const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
    const decoded = atob(padded)
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  }

  // Decode JWT
  const handleDecode = (token: string) => {
    try {
      setError('')
      const parts = token.trim().split('.')

      if (parts.length !== 3) {
        setError('Invalid JWT: Token must have 3 parts separated by dots')
        setDecoded(null)
        return
      }

      const header = JSON.parse(decodeBase64Url(parts[0]))
      const payload = JSON.parse(decodeBase64Url(parts[1]))
      const signature = parts[2]

      // Check expiration
      const isExpired = payload.exp ? Date.now() > payload.exp * 1000 : false
      const expirationDate = payload.exp ? new Date(payload.exp * 1000) : null

      setDecoded({
        header,
        payload,
        signature,
        isValid: true,
        isExpired,
        expirationDate,
      })
    } catch (err) {
      setError(`Failed to decode JWT: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setDecoded(null)
    }
  }

  // Generate demo JWT
  const generateDemoJWT = () => {
    // This is a demo JWT that decodes properly but signature is fake
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = 3600 // 1 hour from now

    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      email: 'john@example.com',
      iat: now,
      exp: now + expiresIn,
    }

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

    // Create a fake signature (for demo purposes only)
    const signature = 'demo_signature_not_valid_' + Math.random().toString(36).substr(2, 9)

    const demoToken = `${encodedHeader}.${encodedPayload}.${signature}`
    setJwtInput(demoToken)
    setShowDemo(true)
    handleDecode(demoToken)
  }

  const handleInputChange = (value: string) => {
    setJwtInput(value)
    if (value.trim()) {
      handleDecode(value)
    } else {
      setDecoded(null)
      setError('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">JWT Tools</h2>
        <p className="text-slate-600 mb-6">Decode JWTs, view payload, check expiration, and generate demo tokens</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">JWT Token</label>
        <textarea
          value={jwtInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="w-full h-24 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={generateDemoJWT}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Generate Demo Token
          </button>
          {showDemo && <span className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">Demo Token</span>}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Decoded JWT Display */}
      {decoded && !error && (
        <div className="space-y-4">
          {/* Expiration Status */}
          {decoded.expirationDate && (
            <div
              className={`rounded-lg p-4 ${
                decoded.isExpired
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${decoded.isExpired ? 'text-red-700' : 'text-green-700'}`}>
                    {decoded.isExpired ? 'Token Expired' : 'Token Valid'}
                  </p>
                  <p className={`text-sm ${decoded.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    Expires: {decoded.expirationDate.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    decoded.isExpired ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
                  }`}
                >
                  {decoded.isExpired ? 'EXPIRED' : 'VALID'}
                </span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Header</h3>
            <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm text-slate-700">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payload</h3>
            <div className="space-y-4">
              {/* Formatted Claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(decoded.payload).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{key}</p>
                    <p className="text-sm text-slate-900 mt-1 break-all">
                      {typeof value === 'number' && (key === 'exp' || key === 'iat' || key === 'nbf')
                        ? new Date(value * 1000).toLocaleString()
                        : JSON.stringify(value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* JSON View */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">JSON</p>
                <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm text-slate-700">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Signature</h3>
            <div className="bg-slate-50 p-4 rounded-lg break-all font-mono text-sm text-slate-700">
              {decoded.signature}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Note: Signature verification requires the secret key and is not performed here.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!jwtInput && !decoded && !error && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">Paste a JWT token above to get started</p>
          <button
            onClick={generateDemoJWT}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            or generate a demo token
          </button>
        </div>
      )}
    </div>
  )
}
