import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const prisma = new PrismaClient()

export default async function EvaluationsPage() {
  const evaluations = await prisma.evaluation.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: {
        select: { name: true },
      },
    },
  })
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
        <p className="text-gray-600 mt-1">Recent boundary evaluations</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terminal State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Failed Gate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link href={`/evaluations/${evaluation.id}`} className="hover:underline">
                    {formatDistanceToNow(evaluation.createdAt, { addSuffix: true })}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {evaluation.direction}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getStateClass(evaluation.terminalState)}`}>
                    {evaluation.terminalState}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {evaluation.failedGate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {evaluation.tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {evaluation.wallTimeMs}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
