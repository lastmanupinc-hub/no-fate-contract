import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function EvaluationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: params.id },
    include: {
      tenant: {
        select: { name: true },
      },
    },
  })
  
  if (!evaluation) {
    notFound()
  }
  
  const gateTrace = evaluation.gateTrace as any[]
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/evaluations" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Evaluations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Evaluation Detail</h1>
        <p className="text-gray-600 mt-1">{evaluation.id}</p>
      </div>
      
      {/* Time Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Observed At</p>
            <p className="text-sm font-mono text-gray-900">
              {evaluation.observedAt?.toISOString() || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Evaluated At</p>
            <p className="text-sm font-mono text-gray-900">
              {evaluation.evaluatedAt.toISOString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Staleness</p>
            <p className="text-sm font-mono text-gray-900">
              {evaluation.stalenessMs ? `${evaluation.stalenessMs}ms` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Temporal Status</p>
            <p className="text-sm font-mono text-gray-900">
              {evaluation.temporalStatus || 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Terminal State */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Terminal State</h2>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex px-4 py-2 text-sm font-medium rounded border ${getStateClass(evaluation.terminalState)}`}>
            {evaluation.terminalState}
          </span>
          {evaluation.failedGate && (
            <span className="text-sm text-gray-600">
              Failed at: <span className="font-mono">{evaluation.failedGate}</span>
            </span>
          )}
          {evaluation.reasonCode && (
            <span className="text-sm text-gray-600">
              Reason: <span className="font-mono">{evaluation.reasonCode}</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Gate Trace */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gate Trace</h2>
        <div className="space-y-3">
          {gateTrace.map((trace, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded border ${
                trace.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${trace.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-mono text-sm font-medium">
                  {trace.gate}
                </span>
                <span className="text-sm text-gray-600">
                  {trace.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {trace.duration_ms}ms
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Metering */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metering</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Bytes In</p>
            <p className="text-lg font-mono text-gray-900">{evaluation.bytesIn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bytes Out</p>
            <p className="text-lg font-mono text-gray-900">{evaluation.bytesOut}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gates Executed</p>
            <p className="text-lg font-mono text-gray-900">{evaluation.gatesExecuted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Audit Writes</p>
            <p className="text-lg font-mono text-gray-900">{evaluation.auditWrites}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Wall Time</p>
            <p className="text-lg font-mono text-gray-900">{evaluation.wallTimeMs}ms</p>
          </div>
        </div>
      </div>
      
      {/* Audit Hash */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Chain</h2>
        <div>
          <p className="text-sm text-gray-500 mb-1">Head Hash</p>
          <p className="text-xs font-mono text-gray-900 break-all bg-gray-50 p-3 rounded">
            {evaluation.auditHeadHash}
          </p>
        </div>
      </div>
    </div>
  )
}

function getStateClass(state: string): string {
  switch (state) {
    case 'DETERMINISTIC_COMPLIANCE':
      return 'state-compliance'
    case 'DETERMINISTIC_VIOLATION':
      return 'state-violation'
    case 'NO_DETERMINISTIC_OUTCOME':
      return 'state-no-outcome'
    case 'INVALID_INPUT':
      return 'state-invalid'
    default:
      return 'state-invalid'
  }
}
