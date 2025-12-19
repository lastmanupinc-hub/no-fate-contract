# Homepage Implementation
## Diamond AI Deterministic Standards Certification Program

**Reference:** Diamond-Certification-Website-Specification.md Section 2  
**Design System:** DESIGN-SYSTEM.md  
**Version:** 1.0 (Frozen)

---

## PAGE STRUCTURE

```
<Layout>
  <Header />
  <main>
    <HeroSection />
    <FourOutcomeModelSection />
    <WhyDeterministicSection />
    <CertificationProcessSection />
    <UseCaseGridSection />
    <TrustSignalsSection />
    <CTASection />
  </main>
  <Footer />
</Layout>
```

---

## COMPONENT IMPLEMENTATIONS

### 1. Hero Section

**Reference:** Spec Section 2.2, Section 1

```tsx
// components/homepage/HeroSection.tsx

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-10">
        {/* SVG pattern or image asset placeholder */}
      </div>

      <div className="relative max-w-container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left column: Messaging */}
          <div className="text-white">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Deterministic AI Evaluation. Auditable Proof of System Behavior.
            </h1>
            
            <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
              The Diamond Standard certifies AI systems through boundary-based evaluation, 
              producing one of four deterministic outcomes: Compliance, Violation, 
              No Deterministic Outcome, or Invalid Input.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="
                bg-accent-500 hover:bg-accent-600 active:bg-accent-700
                text-white font-semibold text-lg
                px-8 py-4 rounded-lg
                transition-colors duration-200
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900
              ">
                Get Certified
              </button>
              
              <button className="
                border-2 border-white hover:bg-white hover:text-primary-900
                text-white font-semibold text-lg
                px-8 py-4 rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-900
              ">
                View Documentation
              </button>
            </div>
          </div>

          {/* Right column: Visual */}
          <div className="hidden lg:block">
            <div className="aspect-square relative">
              {/* Placeholder for hero visual */}
              {/* Image: Abstract geometric boundaries visualization */}
              {/* See IMAGE-GENERATION-PROMPTS.md for asset creation */}
              <div className="absolute inset-0 bg-primary-700 rounded-2xl flex items-center justify-center text-white text-sm">
                [Hero Visual: Deterministic Boundary Classification]
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
```

**SEO Metadata:**
```tsx
// app/page.tsx (Next.js 13+)
export const metadata = {
  title: 'Diamond AI Deterministic Standards Certification | Auditable AI Evaluation',
  description: 'Certify AI systems through deterministic evaluation. Four-outcome classification provides auditable proof of system behavior for compliance, regulatory, and enterprise needs.',
  keywords: 'AI deterministic evaluation, AI system certification, auditable AI compliance, AI boundary standards, deterministic AI classification',
  openGraph: {
    title: 'Diamond AI Deterministic Standards Certification',
    description: 'Auditable proof of AI system behavior through deterministic evaluation.',
    type: 'website',
  }
};
```

---

### 2. Four-Outcome Model Section

**Reference:** Spec Section 2.2 (Section 2)

```tsx
// components/homepage/FourOutcomeModelSection.tsx

export function FourOutcomeModelSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            The Four-Outcome Model
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Every evaluation resolves to exactly one outcome. The system observes 
            and classifies—it does not predict or guarantee future behavior.
          </p>
        </div>

        {/* Grid of four outcomes */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* DETERMINISTIC_COMPLIANCE */}
          <OutcomeCard
            type="compliance"
            title="DETERMINISTIC_COMPLIANCE"
            description="Output satisfies all defined evaluation boundaries"
            icon={CheckCircleIcon}
          />

          {/* DETERMINISTIC_VIOLATION */}
          <OutcomeCard
            type="violation"
            title="DETERMINISTIC_VIOLATION"
            description="Output violates one or more defined evaluation boundaries"
            icon={XCircleIcon}
          />

          {/* NO_DETERMINISTIC_OUTCOME */}
          <OutcomeCard
            type="refusal"
            title="NO_DETERMINISTIC_OUTCOME"
            description="Output cannot be classified deterministically within defined boundaries"
            icon={QuestionMarkCircleIcon}
          />

          {/* INVALID_INPUT */}
          <OutcomeCard
            type="invalid"
            title="INVALID_INPUT"
            description="Input is malformed, out of scope, or cannot be processed"
            icon={ExclamationTriangleIcon}
          />

        </div>

        {/* Explanatory note */}
        <div className="mt-12 max-w-3xl mx-auto bg-white border border-neutral-200 rounded-xl p-6">
          <p className="text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900">Important:</strong> All four outcomes 
            are valid, billable results. "No Deterministic Outcome" indicates the system 
            is operating correctly by acknowledging uncertainty rather than forcing 
            classification. Refusal is not failure—it is integrity.
          </p>
        </div>

      </div>
    </section>
  );
}

// Reusable outcome card component
interface OutcomeCardProps {
  type: 'compliance' | 'violation' | 'refusal' | 'invalid';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function OutcomeCard({ type, title, description, icon: Icon }: OutcomeCardProps) {
  const styles = {
    compliance: {
      bg: 'bg-compliance-50',
      border: 'border-compliance-500',
      iconBg: 'bg-compliance-500',
      textTitle: 'text-compliance-900',
      textDesc: 'text-compliance-700',
    },
    violation: {
      bg: 'bg-violation-50',
      border: 'border-violation-500',
      iconBg: 'bg-violation-500',
      textTitle: 'text-violation-900',
      textDesc: 'text-violation-700',
    },
    refusal: {
      bg: 'bg-refusal-50',
      border: 'border-refusal-500',
      iconBg: 'bg-refusal-500',
      textTitle: 'text-refusal-900',
      textDesc: 'text-refusal-700',
    },
    invalid: {
      bg: 'bg-invalid-50',
      border: 'border-invalid-500',
      iconBg: 'bg-invalid-500',
      textTitle: 'text-invalid-900',
      textDesc: 'text-invalid-700',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-xl p-6`}>
      <div className="flex items-start gap-4">
        <div className={`${style.iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className={`${style.textTitle} font-semibold text-lg mb-2`}>
            {title}
          </h3>
          <p className={`${style.textDesc} text-sm leading-relaxed`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Why Deterministic Standards Matter Section

**Reference:** Spec Section 2.2 (Section 3)

```tsx
// components/homepage/WhyDeterministicSection.tsx

export function WhyDeterministicSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Why Deterministic Standards Matter
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* For Compliance Teams */}
          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              For Compliance Teams
            </h3>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Auditable classification records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Regulator-accepted verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Insurance underwriting support</span>
              </li>
            </ul>
          </div>

          {/* For Development Teams */}
          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              For Development Teams
            </h3>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Clear integration boundaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Predictable evaluation behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Production-grade API reliability</span>
              </li>
            </ul>
          </div>

          {/* For Executives */}
          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              For Executives
            </h3>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Quantifiable risk classification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Public trust signaling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Competitive differentiation</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
```

---

### 4. Certification Process Overview Section

**Reference:** Spec Section 2.2 (Section 4)

```tsx
// components/homepage/CertificationProcessSection.tsx

export function CertificationProcessSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Certification Process Overview
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Five clear steps from integration to public verification
          </p>
        </div>

        {/* Horizontal stepper */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            
            {/* Connection line (desktop only) */}
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-neutral-300" 
                 style={{ width: 'calc(100% - 80px)', marginLeft: '40px' }} />
            
            <div className="grid lg:grid-cols-5 gap-8 relative">
              
              <ProcessStep
                number="1"
                title="Integrate"
                description="Connect your AI system via API"
              />

              <ProcessStep
                number="2"
                title="Evaluate"
                description="Run deterministic boundary checks"
              />

              <ProcessStep
                number="3"
                title="Classify"
                description="Receive outcome distribution analysis"
              />

              <ProcessStep
                number="4"
                title="Certify"
                description="Achieve Diamond Standard certification"
              />

              <ProcessStep
                number="5"
                title="Verify"
                description="Provide public proof to stakeholders"
              />

            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <a 
              href="/about/certification-process" 
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg transition-colors"
            >
              Learn more about the certification process
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center relative">
      
      {/* Number circle */}
      <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-md relative z-10">
        {number}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 text-sm">
        {description}
      </p>

    </div>
  );
}
```

---

### 5. Use Case Grid Section

**Reference:** Spec Section 2.2 (Section 5), Section 6.2

```tsx
// components/homepage/UseCaseGridSection.tsx

const USE_CASES = [
  {
    title: 'Payments & Transactions',
    description: 'Deterministic evaluation for payment fraud detection, AML compliance, and transaction classification',
    icon: CreditCardIcon,
    href: '/use-cases/payments-and-transactions',
  },
  {
    title: 'Insurance Underwriting',
    description: 'Auditable AI classification for policy issuance, claims assessment, and regulatory compliance',
    icon: ShieldCheckIcon,
    href: '/use-cases/insurance-underwriting',
  },
  {
    title: 'Medical Documentation',
    description: 'HIPAA-compliant deterministic evaluation for clinical documentation and medical coding',
    icon: DocumentTextIcon,
    href: '/use-cases/medical-documentation',
  },
  {
    title: 'Legal Research',
    description: 'Citation verification and boundary-based classification for legal AI research tools',
    icon: ScaleIcon,
    href: '/use-cases/legal-research',
  },
  {
    title: 'Financial Markets',
    description: 'Deterministic evaluation for trading systems, market analysis, and regulatory compliance',
    icon: ChartBarIcon,
    href: '/use-cases/financial-markets',
  },
  {
    title: 'Compliance Monitoring',
    description: 'Continuous auditable classification for enterprise AI compliance systems',
    icon: ClipboardCheckIcon,
    href: '/use-cases/compliance-monitoring',
  },
];

export function UseCaseGridSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Use Cases by Industry
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Diamond certification serves regulated industries requiring auditable AI evaluation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((useCase) => (
            <UseCaseCard key={useCase.title} {...useCase} />
          ))}
        </div>

      </div>
    </section>
  );
}

function UseCaseCard({ title, description, icon: Icon, href }: typeof USE_CASES[0]) {
  return (
    <a
      href={href}
      className="group bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-primary-300 rounded-xl p-6 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
          <Icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-neutral-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}
```

---

### 6. Trust Signals Section

**Reference:** Spec Section 2.2 (Section 6)

```tsx
// components/homepage/TrustSignalsSection.tsx

export function TrustSignalsSection() {
  return (
    <section className="py-16 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-container mx-auto px-6">
        
        <div className="grid md:grid-cols-4 gap-8 text-center">
          
          <TrustSignal
            icon={DocumentIcon}
            title="Append-only audit logs"
          />

          <TrustSignal
            icon={CheckBadgeIcon}
            title="Standards-compliant architecture"
          />

          <TrustSignal
            icon={EyeIcon}
            title="Independent verification"
          />

          <TrustSignal
            icon={LockClosedIcon}
            title="Enterprise security"
          />

        </div>
      </div>
    </section>
  );
}

function TrustSignal({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-white border border-neutral-200 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-600" />
      </div>
      <p className="text-neutral-700 font-medium">
        {title}
      </p>
    </div>
  );
}
```

---

### 7. CTA Section

**Reference:** Spec Section 2.2 (Section 7)

```tsx
// components/homepage/CTASection.tsx

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to certify your AI system?
        </h2>
        
        <p className="text-xl text-primary-100 mb-10">
          Start the certification process or speak with our team to learn 
          how Diamond Standards can support your compliance requirements.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="
            bg-accent-500 hover:bg-accent-600 active:bg-accent-700
            text-white font-semibold text-lg
            px-8 py-4 rounded-lg
            transition-colors duration-200
            shadow-lg hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-600
          ">
            Start Certification Process
          </button>
          
          <button className="
            bg-white hover:bg-neutral-100
            text-primary-700 font-semibold text-lg
            px-8 py-4 rounded-lg
            transition-colors duration-200
            shadow-lg
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600
          ">
            Schedule a Consultation
          </button>
        </div>

      </div>
    </section>
  );
}
```

---

## LAYOUT COMPONENTS

### Header

```tsx
// components/layout/Header.tsx

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              {/* Diamond logo icon */}
              <span className="text-white font-bold text-xl">◆</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">
              Diamond
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="/about/how-it-works" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              How It Works
            </a>
            <a href="/get-certified" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Get Certified
            </a>
            <a href="/certification/verify" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Verify Certificate
            </a>
            <a href="/developers" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Developers
            </a>
            <a href="/use-cases" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Use Cases
            </a>
            <a href="/resources" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Resources
            </a>
          </nav>

          {/* Utility navigation */}
          <div className="flex items-center gap-4">
            <a href="/contact" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Contact Sales
            </a>
            <button className="
              bg-primary-600 hover:bg-primary-700
              text-white font-semibold
              px-6 py-2.5 rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ">
              Sign In
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
```

### Footer

```tsx
// components/layout/Footer.tsx

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-container mx-auto px-6 py-16">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="/about/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/about/certification-process" className="hover:text-white transition-colors">Certification Process</a></li>
              <li><a href="/get-certified/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/certification/verify" className="hover:text-white transition-colors">Verify Certificate</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Developers</h3>
            <ul className="space-y-3">
              <li><a href="/developers/documentation" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/developers/api-reference" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="/developers/sandbox" className="hover:text-white transition-colors">Sandbox</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/data-processing" className="hover:text-white transition-colors">Data Processing</a></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-white font-semibold mb-4">Trust</h3>
            <ul className="space-y-3">
              <li><a href="/trust/security" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="/trust/audits" className="hover:text-white transition-colors">Audits</a></li>
              <li><a href="/trust/compliance" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold">◆</span>
            </div>
            <span className="text-white font-semibold">Diamond</span>
          </div>
          <p className="text-sm">
            © 2025 Diamond AI Deterministic Standards. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
```

---

## ACCESSIBILITY IMPLEMENTATION

### Keyboard Navigation
```tsx
// All interactive elements must be keyboard accessible
// Focus indicators applied via Tailwind:
// focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Screen Reader Support
```tsx
// Semantic HTML structure
<header> <nav> <main> <section> <article> <footer>

// ARIA labels where needed
<button aria-label="Open mobile menu">
  <MenuIcon className="w-6 h-6" />
</button>

// Skip link (first element in body)
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded">
  Skip to main content
</a>
```

### Status Communication
```tsx
// All four outcomes have both color AND text labels
// Example from OutcomeCard component:
<div className="flex items-start gap-4">
  <div className={`${iconBg} ...`} aria-hidden="true">
    <Icon />
  </div>
  <div>
    <h3>{title}</h3> {/* Text label, not just color */}
    <p>{description}</p>
  </div>
</div>
```

---

## NEXT.JS FILE STRUCTURE

```
app/
├── layout.tsx              # Root layout with Header/Footer
├── page.tsx                # Homepage (uses all sections above)
├── globals.css             # Tailwind imports + custom CSS
├── about/
│   ├── how-it-works/
│   │   └── page.tsx
│   ├── deterministic-standards/
│   │   └── page.tsx
│   └── certification-process/
│       └── page.tsx
├── certification/
│   └── verify/
│       └── page.tsx
├── developers/
│   └── page.tsx
└── trust/
    └── page.tsx

components/
├── homepage/
│   ├── HeroSection.tsx
│   ├── FourOutcomeModelSection.tsx
│   ├── WhyDeterministicSection.tsx
│   ├── CertificationProcessSection.tsx
│   ├── UseCaseGridSection.tsx
│   ├── TrustSignalsSection.tsx
│   └── CTASection.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx
```

---

## IMPLEMENTATION STATUS

✓ Design system tokens defined  
✓ Component structure specified  
✓ Homepage sections implemented  
✓ Layout components (Header/Footer) specified  
✓ Accessibility requirements integrated  
✓ SEO metadata included  

**Next:** Additional page implementations (How It Works, Deterministic Standards, etc.)
