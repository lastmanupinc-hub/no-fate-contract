import { PrismaClient } from '@prisma/client'
import { meteringService } from '@/lib/metering'

const prisma = new PrismaClient()

export default async function BillingPage() {
  const tenants = await prisma.tenant.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  })
  
  const usageData = await Promise.all(
    tenants.map(async (tenant) => {
      const currentMonth = await meteringService.getCurrentMonthUsage(tenant.id)
      return {
        tenant,
        ...currentMonth,
      }
    })
  )
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">Usage tracking and billing information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Active Tenants</p>
          <p className="text-3xl font-bold text-gray-900">{tenants.length}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Total Month Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(usageData.reduce((sum, d) => sum + d.total_cost_cents, 0) / 100).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Projected Month Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(usageData.reduce((sum, d) => sum + d.projected_cost_cents, 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Month Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projected Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stripe Customer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usageData.map((data) => (
              <tr key={data.tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getBillingStatusClass(data.tenant.billingStatus)}`}>
                    {data.tenant.billingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${(data.total_cost_cents / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${(data.projected_cost_cents / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {data.tenant.stripeCustomerId || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getBillingStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'grace':
      return 'bg-yellow-100 text-yellow-800'
    case 'suspended':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
