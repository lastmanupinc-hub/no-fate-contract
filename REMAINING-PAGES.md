# Remaining Phase-1 Pages
## Verify Certificate, Developer Portal, Trust & Compliance

**Reference:** Diamond-Certification-Website-Specification.md Sections 4.3, 5, 6.3  
**Design System:** DESIGN-SYSTEM.md  
**Version:** 1.0 (Frozen)

---

## 4. VERIFY CERTIFICATE PAGE

**URL:** `/certification/verify`  
**Reference:** Spec Section 4.3  
**Note:** Backend is mocked for Phase-1 demonstration

```tsx
// app/certification/verify/page.tsx

'use client';

import { useState } from 'react';

export default function VerifyCertificatePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CertificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock delay to simulate API call
    setTimeout(() => {
      // Mock data response
      if (query.toLowerCase().includes('acme') || query === 'CERT-20251219-AF32') {
        setResult(MOCK_CERTIFICATION_DATA);
      } else {
        setResult(null);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <main className="bg-white min-h-screen">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            Verify Diamond Certification
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Look up certification status and view outcome statistics for certified companies
          </p>
        </div>
      </section>

      {/* Search Interface */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          
          <form onSubmit={handleSearch} className="mb-8">
            <label htmlFor="search" className="block text-lg font-semibold text-neutral-900 mb-3">
              Enter company name or certificate ID
            </label>
            <div className="flex gap-3">
              <input
                id="search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Acme Financial or CERT-20251219-AF32"
                className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Try: <button type="button" onClick={() => setQuery('Acme Financial')} className="text-primary-600 hover:underline">Acme Financial</button> or <button type="button" onClick={() => setQuery('CERT-20251219-AF32')} className="text-primary-600 hover:underline">CERT-20251219-AF32</button>
            </p>
          </form>

          {/* Results or No Results */}
          {result && <CertificationResultDisplay data={result} />}
          
          {result === null && query && !loading && (
            <NoResultsDisplay query={query} />
          )}

        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            About Certification Verification
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              Diamond certification verification provides public access to certification 
              status and aggregate outcome statistics. This enables auditors, regulators, 
              customers, and partners to independently confirm a company's certification.
            </p>
            <h3 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">What You Can Verify</h3>
            <ul className="space-y-2">
              <li>Current certification status and level</li>
              <li>Certification valid date range</li>
              <li>Aggregate outcome distribution (last 30 days)</li>
              <li>Total evaluation volume</li>
            </ul>
            <h3 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">For Authorized Auditors</h3>
            <p>
              Companies can grant authorized auditors access to detailed evaluation logs 
              and audit replay functionality. Contact the certified company to request 
              auditor access.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}

// Type definitions
interface CertificationResult {
  companyName: string;
  certificationId: string;
  level: string;
  status: 'active' | 'under-review' | 'expired';
  validFrom: string;
  validUntil: string;
  statistics: {
    totalEvaluations: number;
    period: string;
    outcomes: {
      compliance: number;
      violation: number;
      refusal: number;
      invalid: number;
    };
  };
}

// Mock data
const MOCK_CERTIFICATION_DATA: CertificationResult = {
  companyName: 'Acme Financial Technologies Inc.',
  certificationId: 'CERT-20251219-AF32',
  level: 'Enterprise Certified',
  status: 'active',
  validFrom: '2025-06-15',
  validUntil: '2026-06-15',
  statistics: {
    totalEvaluations: 1247382,
    period: 'Last 30 Days',
    outcomes: {
      compliance: 89.3,
      violation: 6.2,
      refusal: 3.8,
      invalid: 0.7,
    },
  },
};

// Components
function CertificationResultDisplay({ data }: { data: CertificationResult }) {
  return (
    <div className="bg-white border-2 border-primary-500 rounded-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-primary-50 border-b border-primary-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              {data.companyName}
            </h2>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-compliance-100 text-compliance-700 text-sm font-medium rounded-full">
                <span className="w-2 h-2 rounded-full bg-compliance-500"></span>
                {data.level}
              </span>
              <span className="text-neutral-600 text-sm">
                ID: {data.certificationId}
              </span>
            </div>
          </div>
          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-neutral-600">Valid From:</span>
            <span className="ml-2 font-medium text-neutral-900">{data.validFrom}</span>
          </div>
          <div>
            <span className="text-neutral-600">Valid Until:</span>
            <span className="ml-2 font-medium text-neutral-900">{data.validUntil}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-8 py-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">
          Evaluation Statistics ({data.statistics.period})
        </h3>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-700 font-medium">Total Evaluations</span>
            <span className="text-2xl font-bold text-neutral-900">
              {data.statistics.totalEvaluations.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <OutcomeBar
            label="DETERMINISTIC_COMPLIANCE"
            percentage={data.statistics.outcomes.compliance}
            color="compliance"
          />
          <OutcomeBar
            label="DETERMINISTIC_VIOLATION"
            percentage={data.statistics.outcomes.violation}
            color="violation"
          />
          <OutcomeBar
            label="NO_DETERMINISTIC_OUTCOME"
            percentage={data.statistics.outcomes.refusal}
            color="refusal"
          />
          <OutcomeBar
            label="INVALID_INPUT"
            percentage={data.statistics.outcomes.invalid}
            color="invalid"
          />
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            Download Verification Report (PDF)
          </button>
          <button className="flex-1 border-2 border-neutral-300 hover:border-primary-600 text-neutral-700 hover:text-primary-600 font-semibold px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
            Request Auditor Access
          </button>
        </div>
      </div>

    </div>
  );
}

function OutcomeBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  const colors = {
    compliance: { bg: 'bg-compliance-500', text: 'text-compliance-700' },
    violation: { bg: 'bg-violation-500', text: 'text-violation-700' },
    refusal: { bg: 'bg-refusal-500', text: 'text-refusal-700' },
    invalid: { bg: 'bg-invalid-500', text: 'text-invalid-700' },
  };
  const colorSet = colors[color as keyof typeof colors];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className={`text-sm font-semibold ${colorSet.text}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorSet.bg} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function NoResultsDisplay({ query }: { query: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-12 text-center">
      <svg className="w-16 h-16 text-neutral-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
        No active certification found
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        No active certification found for "{query}". Certification may be not yet issued, 
        expired, under review, or entered incorrectly.
      </p>
      <div className="space-y-2 text-sm text-neutral-600">
        <p>If you believe this is an error:</p>
        <ul className="space-y-1">
          <li>• Verify the spelling of the company name or certificate ID</li>
          <li>• Contact the company directly for their current status</li>
          <li>• <a href="/contact" className="text-primary-600 hover:underline">Reach out to Diamond support</a></li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 5. DEVELOPER PORTAL - DOCUMENTATION PAGE

**URL:** `/developers`  
**Reference:** Spec Section 5

```tsx
// app/developers/page.tsx

export const metadata = {
  title: 'Developer Documentation | Diamond AI API',
  description: 'Complete documentation for integrating Diamond deterministic evaluation API. API reference, integration guides, and sandbox access.',
  keywords: 'Diamond API, AI evaluation API, deterministic evaluation integration, developer documentation',
};

export default function DeveloperPortalPage() {
  return (
    <main className="bg-white">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            Diamond Deterministic Evaluation API
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Integrate deterministic AI evaluation into your application with boundary-based 
            classification and auditable outcomes
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-8">Quick Start</h2>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <QuickStartCard
              icon="1"
              title="Install SDK"
              description="Add Diamond SDK to your project"
              link="/developers/installation"
            />
            <QuickStartCard
              icon="2"
              title="Authenticate"
              description="Configure API credentials"
              link="/developers/authentication"
            />
            <QuickStartCard
              icon="3"
              title="Evaluate"
              description="Send outputs for classification"
              link="/developers/integration-guide"
            />
          </div>

          {/* Code Example */}
          <div className="bg-neutral-900 rounded-xl overflow-hidden">
            <div className="bg-neutral-800 px-6 py-3 flex items-center justify-between border-b border-neutral-700">
              <span className="text-neutral-300 text-sm font-medium">Node.js / TypeScript</span>
              <button className="text-neutral-400 hover:text-white text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <pre className="p-6 overflow-x-auto text-sm">
              <code className="text-neutral-100 font-mono">
{`// Install SDK
npm install @diamond-ai/evaluation-sdk

// Initialize client
const diamond = new DiamondClient({
  apiKey: process.env.DIAMOND_API_KEY,
  environment: 'sandbox' // or 'production'
});

// Evaluate output
const result = await diamond.evaluate({
  input: userInput,
  output: aiSystemOutput,
  boundaries: ['payment-compliance', 'pii-protection']
});

console.log(result.outcome);
// Returns: 'DETERMINISTIC_COMPLIANCE' | 'DETERMINISTIC_VIOLATION' | 
//          'NO_DETERMINISTIC_OUTCOME' | 'INVALID_INPUT'`}
              </code>
            </pre>
          </div>

        </div>
      </section>

      {/* Core Concepts */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">Core Concepts</h2>

          <div className="grid md:grid-cols-2 gap-8">
            
            <ConceptCard
              title="Evaluation Gates"
              description="Checkpoints in your application where AI output undergoes deterministic classification before proceeding to production use. Gates enforce boundaries at decision points."
              link="/developers/evaluation-gates"
            />

            <ConceptCard
              title="Boundaries"
              description="Explicit criteria against which outputs are evaluated. Boundaries are deterministic (boolean, numeric thresholds, enumerations) rather than probabilistic."
              link="/developers/boundaries"
            />

            <ConceptCard
              title="Four-Outcome Model"
              description="Every evaluation resolves to exactly one of four outcomes: DETERMINISTIC_COMPLIANCE, DETERMINISTIC_VIOLATION, NO_DETERMINISTIC_OUTCOME, or INVALID_INPUT."
              link="/about/deterministic-standards"
            />

            <ConceptCard
              title="Audit Trail"
              description="All evaluations are recorded in append-only logs. Immutable records enable independent verification and audit replay by authorized parties."
              link="/developers/audit-trail"
            />

          </div>
        </div>
      </section>

      {/* API Reference Sections */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">API Reference</h2>

          <div className="space-y-6">
            
            <APIReferenceSection
              method="POST"
              endpoint="/v1/evaluate"
              description="Submit an AI system output for deterministic evaluation"
              link="/developers/api-reference#evaluate"
            />

            <APIReferenceSection
              method="GET"
              endpoint="/v1/evaluations/:id"
              description="Retrieve details of a specific evaluation by ID"
              link="/developers/api-reference#get-evaluation"
            />

            <APIReferenceSection
              method="GET"
              endpoint="/v1/statistics"
              description="Retrieve aggregate outcome statistics for your certified system"
              link="/developers/api-reference#statistics"
            />

            <APIReferenceSection
              method="POST"
              endpoint="/v1/audit/replay"
              description="Re-execute a historical evaluation to verify outcome consistency"
              link="/developers/api-reference#audit-replay"
            />

          </div>
        </div>
      </section>

      {/* Sandbox vs Production */}
      <section className="py-20 bg-refusal-50 border-y border-refusal-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Sandbox vs Production
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-refusal-100 rounded-lg flex items-center justify-center text-refusal-600 font-bold">S</span>
                Sandbox
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-refusal-600 mt-1">•</span>
                  <span><strong>URL:</strong> sandbox-api.diamond-ai.com/v1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-refusal-600 mt-1">•</span>
                  <span><strong>Purpose:</strong> Integration testing, boundary configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-refusal-600 mt-1">•</span>
                  <span><strong>Data:</strong> Not logged to audit trail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-refusal-600 mt-1">•</span>
                  <span><strong>Rate limit:</strong> 1,000 requests/day (free)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-refusal-600 mt-1">•</span>
                  <span><strong>Certification:</strong> Does not count toward certification</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">P</span>
                Production
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>URL:</strong> api.diamond-ai.com/v1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Purpose:</strong> Live evaluation, audit trail, certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Data:</strong> Append-only audit logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Rate limit:</strong> Based on subscription tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span><strong>Certification:</strong> Counts toward certification requirements</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">Resources</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ResourceCard
              icon="📘"
              title="Integration Guide"
              description="Step-by-step implementation walkthrough"
              link="/developers/integration-guide"
            />
            <ResourceCard
              icon="📖"
              title="API Reference"
              description="Complete endpoint documentation"
              link="/developers/api-reference"
            />
            <ResourceCard
              icon="🧪"
              title="Sandbox Access"
              description="Test integration before production"
              link="/developers/sandbox"
            />
            <ResourceCard
              icon="💬"
              title="Community Forum"
              description="Developer community and support"
              link="/developers/forum"
            />
            <ResourceCard
              icon="📊"
              title="Examples Repository"
              description="Code samples and use cases"
              link="/developers/examples"
            />
            <ResourceCard
              icon="🔔"
              title="Changelog"
              description="API updates and version history"
              link="/developers/changelog"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to integrate Diamond evaluation?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-neutral-100 text-primary-700 font-semibold px-8 py-4 rounded-lg transition-colors">
              Get API Credentials
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-primary-700 text-white font-semibold px-8 py-4 rounded-lg transition-all">
              View Full Documentation
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}

// Helper components
function QuickStartCard({ icon, title, description, link }: { icon: string; title: string; description: string; link: string }) {
  return (
    <a href={link} className="block bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-primary-300 rounded-xl p-6 transition-all group">
      <div className="w-12 h-12 bg-primary-600 group-hover:bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm">{description}</p>
    </a>
  );
}

function ConceptCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 mb-4 leading-relaxed">{description}</p>
      <a href={link} className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
        Learn more
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

function APIReferenceSection({ method, endpoint, description, link }: { method: string; endpoint: string; description: string; link: string }) {
  const methodColors = {
    'POST': 'bg-accent-100 text-accent-700',
    'GET': 'bg-compliance-100 text-compliance-700',
    'PUT': 'bg-refusal-100 text-refusal-700',
    'DELETE': 'bg-violation-100 text-violation-700',
  };

  return (
    <a href={link} className="block bg-white border border-neutral-200 hover:border-primary-300 rounded-xl p-6 transition-all group">
      <div className="flex items-start gap-4">
        <span className={`${methodColors[method as keyof typeof methodColors]} px-3 py-1 rounded font-mono text-sm font-semibold flex-shrink-0`}>
          {method}
        </span>
        <div className="flex-1">
          <code className="text-lg font-mono text-neutral-900 mb-2 block">{endpoint}</code>
          <p className="text-neutral-600 text-sm">{description}</p>
        </div>
        <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function ResourceCard({ icon, title, description, link }: { icon: string; title: string; description: string; link: string }) {
  return (
    <a href={link} className="block bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-md rounded-xl p-6 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm">{description}</p>
    </a>
  );
}
```

---

## 6. TRUST & COMPLIANCE PAGE

**URL:** `/trust`  
**Reference:** Spec Section 6.3

```tsx
// app/trust/page.tsx

export const metadata = {
  title: 'Trust & Compliance | Diamond AI Standards',
  description: 'Diamond security, audit standards, and compliance framework information. Learn how we protect data and enable regulatory compliance.',
  keywords: 'AI security, compliance framework, audit standards, SOC 2, GDPR, data protection',
};

export default function TrustPage() {
  return (
    <main className="bg-white">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            Trust & Compliance
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Enterprise security, audit standards, and compliance framework support
          </p>
        </div>
      </section>

      {/* Security */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">Security</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            <SecurityFeature
              icon={<LockIcon />}
              title="Data Encryption"
              items={[
                "TLS 1.3 for data in transit",
                "AES-256 encryption at rest",
                "Certificate pinning for API connections",
                "Encrypted backup storage"
              ]}
            />

            <SecurityFeature
              icon={<ShieldIcon />}
              title="Access Control"
              items={[
                "API key authentication with rotation",
                "Role-based access control (RBAC)",
                "Multi-factor authentication (MFA) available",
                "Audit log access authorization"
              ]}
            />

            <SecurityFeature
              icon={<ServerIcon />}
              title="Infrastructure Security"
              items={[
                "ISO 27001 certified data centers",
                "DDoS protection (Cloudflare)",
                "Regular penetration testing",
                "24/7 security monitoring"
              ]}
            />

            <SecurityFeature
              icon={<DocumentIcon />}
              title="Compliance Certifications"
              items={[
                "SOC 2 Type II (in progress)",
                "GDPR compliant",
                "CCPA compliant",
                "Annual third-party audits"
              ]}
            />

          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Responsible Disclosure
            </h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              If you discover a security vulnerability, please report it to <a href="mailto:security@diamond-ai.com" className="text-primary-600 hover:underline">security@diamond-ai.com</a>. 
              We will respond within 24 hours and work with you to address the issue.
            </p>
            <a href="/trust/security-policy" className="text-primary-600 hover:text-primary-700 font-medium">
              View full security policy →
            </a>
          </div>

        </div>
      </section>

      {/* Audit Standards */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">Audit Standards</h2>

          <div className="space-y-8">
            
            <AuditStandardCard
              title="Append-Only Architecture"
              description="All evaluation records are written to an append-only log. Records cannot be modified or deleted after creation, ensuring immutability for audit purposes."
              features={[
                "Cryptographic hash chaining between records",
                "Timestamp verification",
                "No retroactive modification capability",
                "Tamper-evident structure"
              ]}
            />

            <AuditStandardCard
              title="Audit Replay"
              description="Historical evaluations can be re-executed to verify outcome consistency. Auditors can confirm that re-running an evaluation with the original input and boundaries produces the same outcome."
              features={[
                "Complete input/output preservation",
                "Boundary configuration versioning",
                "Side-by-side outcome comparison",
                "Divergence detection and reporting"
              ]}
            />

            <AuditStandardCard
              title="Export & Reporting"
              description="Evaluation data can be exported in standard formats for integration with compliance management systems and regulatory reporting requirements."
              features={[
                "CSV, JSON, and PDF export",
                "Configurable date ranges",
                "Compliance framework mapping",
                "Automated report scheduling"
              ]}
            />

          </div>

        </div>
      </section>

      {/* Compliance Frameworks */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">Compliance Frameworks</h2>

          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed mb-12">
            <p>
              Diamond certification provides deterministic classification records that support 
              documentation requirements for multiple regulatory frameworks. We do not provide 
              legal advice or guarantee compliance—certified companies remain responsible for 
              meeting all applicable regulatory obligations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            <ComplianceFrameworkCard
              title="Financial Services"
              frameworks={[
                "SOX (Sarbanes-Oxley)",
                "PCI DSS (Payment Card)",
                "AML/KYC regulations",
                "PSD2 (EU payments)",
                "Dodd-Frank Act"
              ]}
            />

            <ComplianceFrameworkCard
              title="Healthcare"
              frameworks={[
                "HIPAA (Health Insurance Portability)",
                "HITECH (Health Information Technology)",
                "FDA regulations (medical devices)",
                "GDPR (EU health data)",
              ]}
            />

            <ComplianceFrameworkCard
              title="Data Protection"
              frameworks={[
                "GDPR (EU General Data Protection)",
                "CCPA (California Consumer Privacy)",
                "CPRA (California Privacy Rights)",
                "Data breach notification laws"
              ]}
            />

            <ComplianceFrameworkCard
              title="Industry-Specific"
              frameworks={[
                "Insurance: State DOI regulations",
                "Legal: Bar association rules",
                "Markets: SEC, FINRA requirements",
                "Government: FISMA, FedRAMP"
              ]}
            />

          </div>

          <div className="mt-12 bg-refusal-50 border border-refusal-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <svg className="w-12 h-12 text-refusal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  Important: No Advisory Services
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Diamond provides deterministic classification of AI system outputs. We do not 
                  provide legal advice, medical advice, financial advice, or regulatory guidance. 
                  Certification does not constitute a guarantee of compliance with any specific 
                  regulation. Consult qualified legal and compliance professionals for regulatory 
                  interpretation and advice.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Data Processing */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Data Processing & Privacy
          </h2>
          
          <div className="space-y-6 text-neutral-600 leading-relaxed">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Data Collection</h3>
              <p>
                Diamond collects only the data necessary to perform deterministic evaluation: 
                input/output content, boundary definitions, timestamps, and outcome classifications. 
                We do not collect or store personal information beyond company contact details for 
                certified organizations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Data Retention</h3>
              <p>
                Evaluation records are retained according to your subscription tier (90 days to custom). 
                After retention period expiry, records are securely deleted. Certified companies can 
                request extended retention for regulatory compliance purposes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Data Residency</h3>
              <p>
                Enterprise customers can select data residency regions (US, EU, Asia-Pacific) to meet 
                jurisdiction-specific requirements. Data does not leave the selected region.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Data Processing Agreement</h3>
              <p>
                All certified companies must execute a Data Processing Agreement (DPA) defining roles, 
                responsibilities, and data handling obligations. GDPR-compliant standard clauses are included.
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <a href="/legal/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
              Privacy Policy →
            </a>
            <a href="/legal/data-processing" className="text-primary-600 hover:text-primary-700 font-medium">
              Data Processing Agreement →
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}

// Helper components
function SecurityFeature({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-neutral-600">
            <span className="text-primary-600 mt-1">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuditStandardCard({ title, description, features }: { title: string; description: string; features: string[] }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-8">
      <h3 className="text-2xl font-semibold text-neutral-900 mb-4">{title}</h3>
      <p className="text-neutral-600 leading-relaxed mb-6">{description}</p>
      <div className="grid md:grid-cols-2 gap-3">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">→</span>
            <span className="text-neutral-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceFrameworkCard({ title, frameworks }: { title: string; frameworks: string[] }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {frameworks.map((framework, i) => (
          <li key={i} className="flex items-start gap-2 text-neutral-600 text-sm">
            <span className="text-primary-600 mt-1">•</span>
            <span>{framework}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Icon placeholders (use actual icon library in production)
function LockIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
```

---

**Implementation Status:**

✓ Verify Certificate page complete (with mock backend)  
✓ Developer Portal documentation page complete  
✓ Trust & Compliance page complete  

**Next:** SEO metadata, visual assets, accessibility audit, deployment checklist
