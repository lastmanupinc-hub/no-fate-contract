import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* NO FATE CONTRACT BANNER */}
      <div className="mb-8 p-4 bg-gray-900 border-2 border-gray-700 rounded-lg">
        <p className="text-white text-center font-mono text-sm">
          <strong>NO FATE CONTRACT</strong> • REFUSAL IS A VALID OUTCOME • SYSTEM OBSERVES BOUNDARIES ONLY
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/evaluations"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluations</h2>
          <p className="text-gray-600">
            Evaluation runs, terminal states, gate traces
          </p>
        </Link>
        
        <Link
          href="/metrics"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Metrics</h2>
          <p className="text-gray-600">
            Refusal rates, gate failures, latency, staleness
          </p>
        </Link>
        
        <Link
          href="/billing"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Billing</h2>
          <p className="text-gray-600">
            Usage, costs, invoices, payment status
          </p>
        </Link>
        
        <Link
          href="/audit"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Log</h2>
          <p className="text-gray-600">
            Hash-chained event log with integrity verification
          </p>
        </Link>
        
        <Link
          href="/admin"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin</h2>
          <p className="text-gray-600">
            Tenant management, API keys, status
          </p>
        </Link>
        
        <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">API Docs</h2>
          <p className="text-gray-600 mb-4">
            POST /api/evaluate/forward<br />
            POST /api/evaluate/backward
          </p>
          <code className="text-xs text-gray-500 block">
            x-api-key: your_api_key
          </code>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Terminal States (No Fate Contract)
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
            DETERMINISTIC_COMPLIANCE
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
            DETERMINISTIC_VIOLATION
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
            NO_DETERMINISTIC_OUTCOME
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-500 mr-3"></span>
            INVALID_INPUT
          </li>
        </ul>
      </div>
    </div>
  )
}
