# Additional Pages Implementation
## Diamond AI Deterministic Standards Certification Program - Phase 1

**Reference:** Diamond-Certification-Website-Specification.md Sections 1.1, 3, 4, 5, 6.3  
**Design System:** DESIGN-SYSTEM.md  
**Version:** 1.0 (Frozen)

---

## 1. HOW IT WORKS PAGE

**URL:** `/about/how-it-works`  
**Reference:** Spec Section 1.1

```tsx
// app/about/how-it-works/page.tsx

export const metadata = {
  title: 'How Diamond Certification Works | Deterministic AI Evaluation',
  description: 'Learn how Diamond provides deterministic evaluation of AI systems through boundary-based classification, producing auditable proof of system behavior.',
  keywords: 'deterministic AI classification, AI evaluation process, boundary-based evaluation, AI audit system',
};

export default function HowItWorksPage() {
  return (
    <main className="bg-white">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            How Diamond Certification Works
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Diamond provides deterministic evaluation of AI system outputs through 
            boundary-based classification. Every evaluation produces exactly one of 
            four outcomes based on observable behavior.
          </p>
        </div>
      </section>

      {/* Core Concept: Deterministic Evaluation */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Deterministic Evaluation
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              Deterministic evaluation classifies AI system outputs against defined boundaries. 
              Unlike probabilistic scoring or subjective review, each evaluation resolves to 
              exactly one outcome:
            </p>
            <ul className="space-y-2">
              <li><strong className="text-neutral-900">DETERMINISTIC_COMPLIANCE</strong> – Output satisfies all boundaries</li>
              <li><strong className="text-neutral-900">DETERMINISTIC_VIOLATION</strong> – Output violates one or more boundaries</li>
              <li><strong className="text-neutral-900">NO_DETERMINISTIC_OUTCOME</strong> – Output cannot be classified deterministically</li>
              <li><strong className="text-neutral-900">INVALID_INPUT</strong> – Input is malformed or out of scope</li>
            </ul>
            <p>
              The system observes and classifies. It does not predict future behavior, 
              guarantee outcomes, or provide advice. Classification is based on the state 
              of the output at the time of evaluation against explicitly defined boundaries.
            </p>
          </div>
        </div>
      </section>

      {/* Boundary Definition */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Boundary Definition
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              Boundaries are explicit criteria against which outputs are evaluated. 
              They are defined during the certification process based on:
            </p>
            <ul className="space-y-2">
              <li>Regulatory requirements specific to your industry</li>
              <li>Internal compliance policies</li>
              <li>Third-party audit standards</li>
              <li>Applicable legal frameworks</li>
            </ul>
            <p>
              Boundaries are deterministic—not implicit or probabilistic. An output 
              either satisfies a boundary or it does not. There is no scoring or 
              confidence interval.
            </p>
          </div>

          {/* Example boundary visualization */}
          <div className="mt-12 bg-white border border-neutral-200 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-6">
              Example: Payment Transaction Boundaries
            </h3>
            <div className="space-y-4">
              <BoundaryItem
                name="AML/KYC Compliance"
                description="Output must not reference entities on OFAC sanctions lists"
                type="Boolean"
              />
              <BoundaryItem
                name="PCI DSS Data Handling"
                description="Output must not contain unmasked payment card data"
                type="Boolean"
              />
              <BoundaryItem
                name="Transaction Velocity"
                description="Transaction count must not exceed defined thresholds"
                type="Numeric"
              />
              <BoundaryItem
                name="Geographic Restrictions"
                description="Transaction origin must be within permitted jurisdictions"
                type="Enumerated"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Evaluation Process
          </h2>
          
          <div className="space-y-8">
            
            <ProcessDiagram />

            <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
              <h3 className="text-2xl font-semibold text-neutral-900">Step-by-Step Workflow</h3>
              
              <div className="space-y-6">
                <EvaluationStep
                  number="1"
                  title="Input Submission"
                  description="Your application submits AI system output to the Diamond API along with relevant context (e.g., transaction data, document content)."
                />
                <EvaluationStep
                  number="2"
                  title="Boundary Checking"
                  description="The evaluation engine checks the output against all defined boundaries for your certification profile."
                />
                <EvaluationStep
                  number="3"
                  title="Outcome Classification"
                  description="The system determines which of the four outcomes applies. If all boundaries are satisfied, the outcome is DETERMINISTIC_COMPLIANCE. If any boundary is violated, the outcome is DETERMINISTIC_VIOLATION. If classification cannot be performed deterministically, the outcome is NO_DETERMINISTIC_OUTCOME. If the input is malformed, the outcome is INVALID_INPUT."
                />
                <EvaluationStep
                  number="4"
                  title="Audit Log Creation"
                  description="The evaluation is recorded in an append-only audit log with timestamp, input/output hash, boundary configuration, and outcome."
                />
                <EvaluationStep
                  number="5"
                  title="Response Delivery"
                  description="Your application receives the outcome and can proceed accordingly (process, reject, escalate, or correct)."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refusal as Valid Outcome */}
      <section className="py-20 bg-refusal-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-refusal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Refusal as Valid Outcome
              </h2>
              <div className="prose prose-lg max-w-none text-neutral-700 leading-relaxed space-y-4">
                <p>
                  <strong>NO_DETERMINISTIC_OUTCOME</strong> indicates the system acknowledged 
                  uncertainty rather than forcing a classification. This is not a failure—it is 
                  a valid, billable result.
                </p>
                <p>
                  Refusal occurs when:
                </p>
                <ul className="space-y-2">
                  <li>Output content is ambiguous relative to boundary definitions</li>
                  <li>Boundary applicability cannot be determined from available information</li>
                  <li>Conflicting boundary conditions create indeterminacy</li>
                </ul>
                <p>
                  When this outcome is returned, the appropriate action is escalation to human 
                  judgment, not system error handling. The Diamond system is operating correctly 
                  by refusing to classify when deterministic classification is not possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit & Verification */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Audit & Verification
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              All evaluations are recorded in an append-only audit log. This enables:
            </p>
            <ul className="space-y-2">
              <li><strong className="text-neutral-900">Independent verification</strong> – Auditors and regulators can review evaluation records</li>
              <li><strong className="text-neutral-900">Audit replay</strong> – Historical evaluations can be re-executed to confirm outcome consistency</li>
              <li><strong className="text-neutral-900">Compliance documentation</strong> – Evaluation records support regulatory reporting requirements</li>
              <li><strong className="text-neutral-900">Immutability</strong> – Records cannot be retroactively modified or deleted</li>
            </ul>
            <p>
              Certified companies receive a public verification page displaying aggregate 
              outcome statistics and certification status. Authorized auditors can access 
              detailed evaluation logs and replay functionality.
            </p>
          </div>

          <div className="mt-8">
            <a 
              href="/certification/verify"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Verify a Certificate
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}

// Helper components
function BoundaryItem({ name, description, type }: { name: string; description: string; type: string }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200 last:border-0">
      <div>
        <h4 className="font-semibold text-neutral-900 mb-1">{name}</h4>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full whitespace-nowrap">
        {type}
      </span>
    </div>
  );
}

function EvaluationStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h4>
        <p className="text-neutral-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ProcessDiagram() {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <DiagramBox label="AI System Output" color="bg-neutral-200" />
        <Arrow />
        <DiagramBox label="Diamond Evaluation API" color="bg-primary-100" />
        <Arrow />
        <DiagramBox label="Boundary Checks" color="bg-primary-100" />
        <Arrow />
        <div className="grid grid-cols-2 gap-4">
          <DiagramBox label="COMPLIANCE" color="bg-compliance-100" small />
          <DiagramBox label="VIOLATION" color="bg-violation-100" small />
          <DiagramBox label="NO OUTCOME" color="bg-refusal-100" small />
          <DiagramBox label="INVALID" color="bg-invalid-100" small />
        </div>
        <Arrow />
        <DiagramBox label="Append-Only Audit Log" color="bg-neutral-200" />
      </div>
    </div>
  );
}

function DiagramBox({ label, color, small }: { label: string; color: string; small?: boolean }) {
  return (
    <div className={`${color} border-2 border-neutral-300 rounded-lg ${small ? 'p-3' : 'p-4'} text-center`}>
      <span className={`font-semibold text-neutral-900 ${small ? 'text-sm' : 'text-base'}`}>{label}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center">
      <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}
```

---

## 2. DETERMINISTIC STANDARDS PAGE

**URL:** `/about/deterministic-standards`  
**Reference:** Spec Section 4.1

```tsx
// app/about/deterministic-standards/page.tsx

export const metadata = {
  title: 'The Diamond Standard for AI Certification | Deterministic Evaluation',
  description: 'The Diamond Standard provides deterministic evaluation of AI systems through boundary-based classification. Learn about the four outcomes, certification levels, and boundary definition.',
  keywords: 'Diamond Standard, AI certification standard, deterministic boundaries, AI evaluation framework',
};

export default function DeterministicStandardsPage() {
  return (
    <main className="bg-white">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            The Diamond Standard for AI System Certification
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Deterministic evaluation through boundary-based classification. 
            Every evaluation produces exactly one of four outcomes based on 
            observable system behavior.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              The Diamond Standard provides deterministic evaluation of AI system outputs 
              through boundary-based classification. Unlike probabilistic scoring or subjective 
              review, every evaluation produces exactly one of four outcomes based on observable 
              system behavior.
            </p>
          </div>
        </div>
      </section>

      {/* The Four Outcomes (Expanded) */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">
            The Four Outcomes
          </h2>

          <div className="space-y-8">
            
            {/* DETERMINISTIC_COMPLIANCE */}
            <OutcomeDetailCard
              type="compliance"
              title="DETERMINISTIC_COMPLIANCE"
              definition="Output satisfies all defined evaluation boundaries"
              interpretation="The output, at the time of evaluation, met all specified criteria"
              whatItIsNot={[
                "A guarantee of future compliance",
                "A quality endorsement",
                "A prediction of future behavior"
              ]}
              useInPractice="Documentation for auditors and regulators; enables transaction processing in automated workflows"
            />

            {/* DETERMINISTIC_VIOLATION */}
            <OutcomeDetailCard
              type="violation"
              title="DETERMINISTIC_VIOLATION"
              definition="Output violates one or more defined evaluation boundaries"
              interpretation="The output, at the time of evaluation, failed to meet one or more specified criteria"
              whatItIsNot={[
                "A judgment of intent",
                "A legal determination",
                "A permanent classification of the system"
              ]}
              useInPractice="Rejection trigger for automated systems; escalation to human review; audit documentation of non-compliant outputs"
            />

            {/* NO_DETERMINISTIC_OUTCOME */}
            <OutcomeDetailCard
              type="refusal"
              title="NO_DETERMINISTIC_OUTCOME"
              definition="Output cannot be classified deterministically within defined boundaries"
              interpretation="Insufficient information or boundary ambiguity prevents deterministic classification"
              whatItIsNot={[
                "A system failure",
                "An error state",
                "A negative result requiring remediation"
              ]}
              useInPractice="Escalation to human judgment; signal for boundary refinement; valid refusal acknowledged as correct system behavior"
            />

            {/* INVALID_INPUT */}
            <OutcomeDetailCard
              type="invalid"
              title="INVALID_INPUT"
              definition="Input is malformed, out of scope, or cannot be processed"
              interpretation="The evaluation could not be performed due to input issues"
              whatItIsNot={[
                "An output quality judgment",
                "A system capability limitation"
              ]}
              useInPractice="Client-side validation signal; integration debugging; input format correction"
            />

          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">
            Certification Levels
          </h2>

          <div className="space-y-6">
            
            <CertificationLevelCard
              level="Level 1: Integration Certified"
              requirements={[
                "API successfully integrated",
                "Test evaluations completed",
                "Sandbox validated",
                "No production volume requirement"
              ]}
              badgeColor="bg-neutral-500"
            />

            <CertificationLevelCard
              level="Level 2: Operationally Certified"
              requirements={[
                "Minimum 1,000 production evaluations",
                "Outcome distribution analyzed",
                "Audit logs verified",
                "Public certification page enabled"
              ]}
              badgeColor="bg-primary-600"
            />

            <CertificationLevelCard
              level="Level 3: Enterprise Certified"
              requirements={[
                "Minimum 100,000 production evaluations",
                "Third-party audit completed (if applicable)",
                "Custom compliance reporting",
                "Dedicated account management"
              ]}
              badgeColor="bg-accent-600"
            />

          </div>
        </div>
      </section>

      {/* Certification Maintenance */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Certification Maintenance
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 leading-relaxed space-y-4">
            <p>
              Certification status reflects current operational state. Certification may change 
              to "Under Review" if:
            </p>
            <ul className="space-y-2">
              <li>API integration is removed or disabled</li>
              <li>Evaluation volume drops below certification threshold for 90 consecutive days</li>
              <li>Outcome distributions show anomalies requiring investigation</li>
              <li>Audit access is restricted or denied to authorized parties</li>
            </ul>
            <p>
              Companies are notified 30 days before certification status changes. Resolution 
              options and timeline are provided.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to achieve Diamond Certification?
          </h2>
          <a 
            href="/get-certified"
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Start Certification Process
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

    </main>
  );
}

// Helper components
interface OutcomeDetailCardProps {
  type: 'compliance' | 'violation' | 'refusal' | 'invalid';
  title: string;
  definition: string;
  interpretation: string;
  whatItIsNot: string[];
  useInPractice: string;
}

function OutcomeDetailCard({ type, title, definition, interpretation, whatItIsNot, useInPractice }: OutcomeDetailCardProps) {
  const styles = {
    compliance: { bg: 'bg-compliance-50', border: 'border-compliance-500', text: 'text-compliance-900' },
    violation: { bg: 'bg-violation-50', border: 'border-violation-500', text: 'text-violation-900' },
    refusal: { bg: 'bg-refusal-50', border: 'border-refusal-500', text: 'text-refusal-900' },
    invalid: { bg: 'bg-invalid-50', border: 'border-invalid-500', text: 'text-invalid-900' },
  };
  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-xl p-8`}>
      <h3 className={`${style.text} text-2xl font-bold mb-6`}>{title}</h3>
      
      <div className="space-y-6 text-neutral-700">
        <div>
          <h4 className="font-semibold text-neutral-900 mb-2">Definition</h4>
          <p>{definition}</p>
        </div>

        <div>
          <h4 className="font-semibold text-neutral-900 mb-2">Interpretation</h4>
          <p>{interpretation}</p>
        </div>

        <div>
          <h4 className="font-semibold text-neutral-900 mb-2">What It Is NOT</h4>
          <ul className="space-y-1 list-disc list-inside">
            {whatItIsNot.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-neutral-900 mb-2">Use in Practice</h4>
          <p>{useInPractice}</p>
        </div>
      </div>
    </div>
  );
}

function CertificationLevelCard({ level, requirements, badgeColor }: { level: string; requirements: string[]; badgeColor: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className={`${badgeColor} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">{level}</h3>
          <ul className="space-y-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-neutral-600">
                <span className="text-primary-600 mt-1">✓</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. CERTIFICATION PROCESS PAGE

**URL:** `/about/certification-process`  
**Reference:** Spec Section 3

```tsx
// app/about/certification-process/page.tsx

export const metadata = {
  title: 'Certification Process | Diamond AI Standards',
  description: 'Learn the step-by-step process to certify your AI system with Diamond Standards. From integration through public verification.',
  keywords: 'AI certification process, how to certify AI, Diamond certification steps',
};

export default function CertificationProcessPage() {
  return (
    <main className="bg-white">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-20">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            Certification Process
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            From integration to public verification in five clear steps
          </p>
        </div>
      </section>

      {/* Process Steps (Detailed) */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="space-y-16">
            
            {/* Step 1: Integrate */}
            <ProcessDetailStep
              number="1"
              title="Integrate"
              subtitle="Connect your AI system via API"
              description="Begin by integrating the Diamond evaluation API into your AI system workflow. This involves installing the SDK, configuring authentication, and defining evaluation gates—checkpoints where AI outputs undergo deterministic classification."
              tasks={[
                "Install Diamond SDK (npm, pip, or REST API)",
                "Configure API authentication with provided credentials",
                "Identify evaluation points in your application flow",
                "Implement evaluation gate calls at decision points",
                "Test integration in sandbox environment"
              ]}
              documentation="/developers/integration-guide"
            />

            {/* Step 2: Evaluate */}
            <ProcessDetailStep
              number="2"
              title="Evaluate"
              subtitle="Run deterministic boundary checks"
              description="Submit AI system outputs for evaluation. Each output is checked against your defined boundaries, producing one of four deterministic outcomes. Begin with sandbox testing, then transition to production evaluations."
              tasks={[
                "Define industry-specific boundaries with Diamond team",
                "Run test evaluations in sandbox with sample data",
                "Review outcome distributions and adjust boundaries if needed",
                "Migrate to production API endpoint",
                "Monitor evaluation performance and response times"
              ]}
              documentation="/developers/sandbox"
            />

            {/* Step 3: Classify */}
            <ProcessDetailStep
              number="3"
              title="Classify"
              subtitle="Receive outcome distribution analysis"
              description="Access your dashboard to review outcome distributions. Understand what percentage of evaluations result in each of the four outcomes. Use this data to refine boundaries, improve system outputs, or adjust downstream handling."
              tasks={[
                "Access Diamond dashboard with production data",
                "Review outcome distribution statistics",
                "Analyze trends over time (daily, weekly, monthly)",
                "Identify patterns in refusal or violation outcomes",
                "Refine boundaries or escalation workflows as needed"
              ]}
              documentation="/developers/dashboard"
            />

            {/* Step 4: Certify */}
            <ProcessDetailStep
              number="4"
              title="Certify"
              subtitle="Achieve Diamond Standard certification"
              description="Once evaluation volume and outcome distributions meet certification criteria, you receive Diamond Standard certification. Certification level (Integration, Operational, or Enterprise) depends on volume and optional third-party audit completion."
              tasks={[
                "Reach minimum evaluation threshold (1,000+ for Operational)",
                "Maintain consistent evaluation volume",
                "Complete any required third-party audits (Enterprise)",
                "Receive certification notification",
                "Configure public certification page branding"
              ]}
              documentation="/about/deterministic-standards"
            />

            {/* Step 5: Verify */}
            <ProcessDetailStep
              number="5"
              title="Verify"
              subtitle="Provide public proof to stakeholders"
              description="Share your public certification page with auditors, regulators, customers, and partners. They can verify your certification status, view outcome statistics, and (if authorized) access audit replay functionality."
              tasks={[
                "Access your public certification page URL",
                "Share URL or QR code with stakeholders",
                "Invite auditors to access detailed logs (if needed)",
                "Download verification reports for compliance documentation",
                "Monitor certification status in dashboard"
              ]}
              documentation="/certification/verify"
            />

          </div>

        </div>
      </section>

      {/* Timeline & Requirements */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12">
            Timeline & Requirements
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Typical Timeline</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex justify-between gap-4">
                  <span>Integration</span>
                  <span className="font-medium text-neutral-900">1-2 weeks</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Sandbox testing</span>
                  <span className="font-medium text-neutral-900">1 week</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Production ramp-up</span>
                  <span className="font-medium text-neutral-900">2-4 weeks</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Operational certification</span>
                  <span className="font-medium text-neutral-900">4-8 weeks</span>
                </li>
                <li className="flex justify-between gap-4 pt-3 border-t border-neutral-200">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-primary-600">8-15 weeks</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Requirements</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>API-accessible AI system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Technical contact for integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Defined compliance boundaries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Active subscription tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Minimum evaluation volume</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to start the certification process?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/get-certified"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              Begin Onboarding
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-neutral-300 hover:border-primary-600 text-neutral-700 hover:text-primary-600 font-semibold px-8 py-4 rounded-lg transition-all"
            >
              Schedule Consultation
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}

// Helper component
interface ProcessDetailStepProps {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  tasks: string[];
  documentation: string;
}

function ProcessDetailStep({ number, title, subtitle, description, tasks, documentation }: ProcessDetailStepProps) {
  return (
    <div className="flex gap-8">
      
      {/* Number badge */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
          {number}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-xl text-primary-600 mb-4">{subtitle}</p>
        <p className="text-neutral-600 leading-relaxed mb-6">{description}</p>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-4">
          <h4 className="font-semibold text-neutral-900 mb-3">Key Tasks</h4>
          <ul className="space-y-2">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-neutral-600">
                <span className="text-primary-600 mt-1">→</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>

        <a 
          href={documentation}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          View documentation
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

    </div>
  );
}
```

---

**Implementation Status:**

✓ How It Works page complete  
✓ Deterministic Standards page complete  
✓ Certification Process page complete  

**Next:** Verify Certificate page, Developer Portal, Trust & Compliance page
