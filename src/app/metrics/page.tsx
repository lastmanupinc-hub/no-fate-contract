import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function MetricsPage() {
  // Get evaluations for current month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const evaluations = await prisma.evaluation.findMany({
    where: {
      createdAt: {
        gte: monthStart,
      },
    },
  })
  
  // Calculate metrics
  const totalEvaluations = evaluations.length
  const complianceCount = evaluations.filter(e => e.terminalState === 'DETERMINISTIC_COMPLIANCE').length
  const violationCount = evaluations.filter(e => e.terminalState === 'DETERMINISTIC_VIOLATION').length
  const noOutcomeCount = evaluations.filter(e => e.terminalState === 'NO_DETERMINISTIC_OUTCOME').length
  const invalidCount = evaluations.filter(e => e.terminalState === 'INVALID_INPUT').length
  
  const refusalRate = totalEvaluations > 0 
    ? ((violationCount + noOutcomeCount + invalidCount) / totalEvaluations) * 100 
    : 0
  
  // Failures by gate
  const failuresByGate: Record<string, number> = {}
  evaluations.forEach(e => {
    if (e.failedGate) {
      failuresByGate[e.failedGate] = (failuresByGate[e.failedGate] || 0) + 1
    }
  })
  
  // P95 latency
  const latencies = evaluations.map(e => e.wallTimeMs).sort((a, b) => a - b)
  const p95Index = Math.floor(latencies.length * 0.95)
  const p95Latency = latencies[p95Index] || 0
  
  // Staleness distribution
  const freshCount = evaluations.filter(e => e.temporalStatus === 'FRESH').length
  const staleCount = evaluations.filter(e => e.temporalStatus === 'STALE').length
  const driftedCount = evaluations.filter(e => e.temporalStatus === 'DRIFTED').length
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Metrics</h1>
        <p className="text-gray-600 mt-1">Current month statistics</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Total Evaluations</p>
          <p className="text-3xl font-bold text-gray-900">{totalEvaluations}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Refusal Rate</p>
          <p className="text-3xl font-bold text-gray-900">{refusalRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">P95 Latency</p>
          <p className="text-3xl font-bold text-gray-900">{p95Latency}ms</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Compliance Rate</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalEvaluations > 0 ? ((complianceCount / totalEvaluations) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
      
      {/* Terminal States Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Terminal States Distribution</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">DETERMINISTIC_COMPLIANCE</span>
            <div className="flex items-center space-x-3">
              <div className="w-64 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${totalEvaluations > 0 ? (complianceCount / totalEvaluations) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-gray-900 w-16 text-right">{complianceCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">DETERMINISTIC_VIOLATION</span>
            <div className="flex items-center space-x-3">
              <div className="w-64 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500"
                  style={{ width: `${totalEvaluations > 0 ? (violationCount / totalEvaluations) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-gray-900 w-16 text-right">{violationCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">NO_DETERMINISTIC_OUTCOME</span>
            <div className="flex items-center space-x-3">
              <div className="w-64 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ width: `${totalEvaluations > 0 ? (noOutcomeCount / totalEvaluations) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-gray-900 w-16 text-right">{noOutcomeCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">INVALID_INPUT</span>
            <div className="flex items-center space-x-3">
              <div className="w-64 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-500"
                  style={{ width: `${totalEvaluations > 0 ? (invalidCount / totalEvaluations) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-gray-900 w-16 text-right">{invalidCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Failures by Gate */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Failures by Gate</h2>
        <div className="space-y-3">
          {Object.entries(failuresByGate).map(([gate, count]) => (
            <div key={gate} className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-600">{gate}</span>
              <span className="text-sm font-mono text-gray-900">{count}</span>
            </div>
          ))}
          {Object.keys(failuresByGate).length === 0 && (
            <p className="text-sm text-gray-500">No gate failures recorded</p>
          )}
        </div>
      </div>
      
      {/* Staleness Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Staleness Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">FRESH</p>
            <p className="text-2xl font-bold text-green-600">{freshCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">STALE</p>
            <p className="text-2xl font-bold text-yellow-600">{staleCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">DRIFTED</p>
            <p className="text-2xl font-bold text-red-600">{driftedCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
