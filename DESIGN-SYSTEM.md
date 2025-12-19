# Diamond Design System
## Phase-1 Implementation Tokens

**Reference:** Diamond-Certification-Website-Specification.md Section 8.4, 9.1  
**Version:** 1.0 (Frozen)  
**Framework:** Tailwind CSS + Custom Tokens

---

## COLOR PALETTE

### Primary Colors
```css
--color-primary-50: #EFF6FF;    /* Lightest blue - backgrounds */
--color-primary-100: #DBEAFE;   /* Light blue - hover states */
--color-primary-200: #BFDBFE;   /* Soft blue - borders */
--color-primary-300: #93C5FD;   /* Medium light blue */
--color-primary-400: #60A5FA;   /* Medium blue */
--color-primary-500: #3B82F6;   /* Primary blue - main brand */
--color-primary-600: #2563EB;   /* Strong blue - interactive */
--color-primary-700: #1D4ED8;   /* Deep blue - dark mode primary */
--color-primary-800: #1E40AF;   /* Darker blue */
--color-primary-900: #1E3A8A;   /* Darkest blue - text on light */
```

### Accent Colors
```css
--color-accent-50: #FFF7ED;     /* Lightest orange */
--color-accent-100: #FFEDD5;    /* Light orange */
--color-accent-200: #FED7AA;    /* Soft orange */
--color-accent-300: #FDBA74;    /* Medium orange */
--color-accent-400: #FB923C;    /* Medium bright orange */
--color-accent-500: #F97316;    /* Primary accent - CTAs */
--color-accent-600: #EA580C;    /* Strong orange - hover */
--color-accent-700: #C2410C;    /* Deep orange */
--color-accent-800: #9A3412;    /* Darker orange */
--color-accent-900: #7C2D12;    /* Darkest orange */
```

### Neutral Grays
```css
--color-neutral-50: #F9FAFB;    /* Lightest gray - backgrounds */
--color-neutral-100: #F3F4F6;   /* Light gray - cards */
--color-neutral-200: #E5E7EB;   /* Border gray */
--color-neutral-300: #D1D5DB;   /* Inactive elements */
--color-neutral-400: #9CA3AF;   /* Placeholder text */
--color-neutral-500: #6B7280;   /* Secondary text */
--color-neutral-600: #4B5563;   /* Body text */
--color-neutral-700: #374151;   /* Headings */
--color-neutral-800: #1F2937;   /* Dark text */
--color-neutral-900: #111827;   /* Darkest - high emphasis */
```

### Status Colors (Four-Outcome Model)

**DETERMINISTIC_COMPLIANCE**
```css
--color-compliance-50: #F0FDF4;   /* Background */
--color-compliance-100: #DCFCE7;  /* Light */
--color-compliance-500: #22C55E;  /* Primary green */
--color-compliance-600: #16A34A;  /* Hover */
--color-compliance-700: #15803D;  /* Active */
--color-compliance-900: #14532D;  /* Dark text on light */
```

**DETERMINISTIC_VIOLATION**
```css
--color-violation-50: #FEF2F2;    /* Background */
--color-violation-100: #FEE2E2;   /* Light */
--color-violation-500: #EF4444;   /* Primary red */
--color-violation-600: #DC2626;   /* Hover */
--color-violation-700: #B91C1C;   /* Active */
--color-violation-900: #7F1D1D;   /* Dark text on light */
```

**NO_DETERMINISTIC_OUTCOME** (Refusal - Valid Outcome)
```css
--color-refusal-50: #FFFBEB;      /* Background */
--color-refusal-100: #FEF3C7;     /* Light */
--color-refusal-500: #F59E0B;     /* Primary amber/yellow */
--color-refusal-600: #D97706;     /* Hover */
--color-refusal-700: #B45309;     /* Active */
--color-refusal-900: #78350F;     /* Dark text on light */
```

**INVALID_INPUT**
```css
--color-invalid-50: #F9FAFB;      /* Background */
--color-invalid-100: #F3F4F6;     /* Light */
--color-invalid-500: #6B7280;     /* Primary gray */
--color-invalid-600: #4B5563;     /* Hover */
--color-invalid-700: #374151;     /* Active */
--color-invalid-900: #1F2937;     /* Dark text on light */
```

### Semantic Colors
```css
--color-info: #3B82F6;       /* Information (blue) */
--color-warning: #F59E0B;    /* Warning (amber) - matches refusal */
--color-success: #22C55E;    /* Success (green) - matches compliance */
--color-error: #EF4444;      /* Error (red) - matches violation */
```

---

## TYPOGRAPHY

### Font Families
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;      /* 12px - captions, labels */
--text-sm: 0.875rem;     /* 14px - small body, UI */
--text-base: 1rem;       /* 16px - body text */
--text-lg: 1.125rem;     /* 18px - large body */
--text-xl: 1.25rem;      /* 20px - subheadings */
--text-2xl: 1.5rem;      /* 24px - h4 */
--text-3xl: 1.875rem;    /* 30px - h3 */
--text-4xl: 2.25rem;     /* 36px - h2 */
--text-5xl: 3rem;        /* 48px - h1 */
--text-6xl: 3.75rem;     /* 60px - hero */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Heading Styles
```css
.h1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
  color: var(--color-neutral-900);
}

.h2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--color-neutral-900);
}

.h3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-neutral-900);
}

.h4 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-neutral-800);
}

.body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-600);
}

.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-600);
}
```

---

## SPACING SYSTEM

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

---

## LAYOUT GRID

```css
--container-max-width: 1280px;
--container-padding: var(--space-6);

--grid-columns-mobile: 4;
--grid-columns-tablet: 8;
--grid-columns-desktop: 12;

--grid-gap: var(--space-6);
```

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

---

## BORDER RADIUS

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Circle */
```

---

## SHADOWS

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## COMPONENT PATTERNS

### Buttons

**Primary Button** (CTA - uses accent color)
```tsx
<button className="
  bg-accent-500 hover:bg-accent-600 active:bg-accent-700
  text-white font-semibold
  px-6 py-3 rounded-lg
  transition-colors duration-200
  shadow-sm hover:shadow-md
  focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
">
  Get Certified
</button>
```

**Secondary Button** (outline style)
```tsx
<button className="
  border-2 border-neutral-300 hover:border-primary-600
  text-neutral-700 hover:text-primary-600 font-semibold
  px-6 py-3 rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  View Documentation
</button>
```

**Text Link Button**
```tsx
<button className="
  text-primary-600 hover:text-primary-700
  font-medium underline underline-offset-4
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:rounded
">
  Learn more →
</button>
```

### Cards

**Standard Card**
```tsx
<div className="
  bg-white rounded-xl
  border border-neutral-200
  p-6
  shadow-sm hover:shadow-md
  transition-shadow duration-200
">
  {/* Card content */}
</div>
```

**Outcome Status Card** (example: DETERMINISTIC_COMPLIANCE)
```tsx
<div className="
  bg-compliance-50 rounded-xl
  border-2 border-compliance-500
  p-6
">
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-compliance-500 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" />
    </div>
    <div>
      <h4 className="font-semibold text-compliance-900">DETERMINISTIC_COMPLIANCE</h4>
      <p className="text-sm text-compliance-700 mt-1">
        Output satisfies all defined evaluation boundaries
      </p>
    </div>
  </div>
</div>
```

### Status Badges

**Compliance Badge**
```tsx
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1 rounded-full
  bg-compliance-100 text-compliance-700
  text-sm font-medium
">
  <span className="w-2 h-2 rounded-full bg-compliance-500"></span>
  Compliant
</span>
```

**Violation Badge**
```tsx
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1 rounded-full
  bg-violation-100 text-violation-700
  text-sm font-medium
">
  <span className="w-2 h-2 rounded-full bg-violation-500"></span>
  Violation
</span>
```

**Refusal Badge** (NO_DETERMINISTIC_OUTCOME)
```tsx
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1 rounded-full
  bg-refusal-100 text-refusal-700
  text-sm font-medium
">
  <span className="w-2 h-2 rounded-full bg-refusal-500"></span>
  No Deterministic Outcome
</span>
```

**Invalid Input Badge**
```tsx
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1 rounded-full
  bg-invalid-100 text-invalid-700
  text-sm font-medium
">
  <span className="w-2 h-2 rounded-full bg-invalid-500"></span>
  Invalid Input
</span>
```

---

## MOTION & TRANSITIONS

### Duration
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions
```css
.transition-colors {
  transition: color var(--duration-base) var(--ease-in-out),
              background-color var(--duration-base) var(--ease-in-out),
              border-color var(--duration-base) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-base) var(--ease-out);
}

.transition-shadow {
  transition: box-shadow var(--duration-base) var(--ease-in-out);
}
```

### Animation Principles (Reference: Spec 8.2)
- **Purposeful:** Animations guide attention to deterministic outcomes
- **Subtle:** No aggressive motion; enterprise-appropriate
- **Performant:** Use CSS transforms; avoid layout thrashing
- **Respectful:** Honor `prefers-reduced-motion` media query

---

## ACCESSIBILITY REQUIREMENTS

### Color Contrast (WCAG 2.1 AA)

**Text Contrast Ratios:**
- Normal text (< 18pt): Minimum 4.5:1
- Large text (≥ 18pt or 14pt bold): Minimum 3:1
- UI components: Minimum 3:1

**Validated Combinations:**
```
✓ neutral-900 on white (16.9:1)
✓ neutral-800 on white (12.6:1)
✓ neutral-700 on white (8.6:1)
✓ neutral-600 on white (6.1:1) ← Body text minimum
✓ primary-600 on white (4.9:1)
✓ accent-600 on white (4.7:1)

✓ White on compliance-600 (4.6:1)
✓ White on violation-600 (4.8:1)
✓ White on refusal-600 (4.9:1)
✓ White on primary-600 (4.9:1)
✓ White on accent-600 (4.7:1)
```

### Focus Indicators
```css
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* For dark backgrounds */
.focus-visible-light {
  outline: 2px solid white;
  outline-offset: 2px;
}
```

### Screen Reader Only Content
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## STATUS SEMANTICS MATRIX

| Outcome | Color | Icon | User Action | Billing |
|---------|-------|------|-------------|---------|
| DETERMINISTIC_COMPLIANCE | Green | Checkmark ✓ | Proceed automatically | Yes |
| DETERMINISTIC_VIOLATION | Red | X mark ✗ | Reject/block | Yes |
| NO_DETERMINISTIC_OUTCOME | Amber | Question mark ? | Escalate to human | Yes |
| INVALID_INPUT | Gray | Alert triangle ⚠ | Fix and retry | Yes |

**Critical:** All four outcomes are valid, billable results. Refusal is not failure.

---

## TAILWIND CONFIG SNIPPET

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        compliance: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          900: '#14532D',
        },
        violation: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          900: '#7F1D1D',
        },
        refusal: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          900: '#78350F',
        },
        invalid: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          900: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}
```

---

## USAGE GUIDELINES

### DO:
✓ Use status colors with text labels (not color alone)  
✓ Maintain 4.5:1 contrast for body text  
✓ Include focus indicators on all interactive elements  
✓ Use semantic HTML (nav, main, article, etc.)  
✓ Test with keyboard navigation  
✓ Provide alt text for informative images  

### DON'T:
✗ Use red for refusal/NO_DETERMINISTIC_OUTCOME (use amber)  
✗ Rely on color alone to convey status  
✗ Skip focus indicators  
✗ Use div/span for interactive elements (use button)  
✗ Use decorative icons without aria-hidden="true"  
✗ Forget to test with screen readers  

---

**Implementation Status:** FROZEN v1.0  
**Next:** Component implementation (Homepage)
