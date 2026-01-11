# Workstream Design Specification

> This document is the source of truth for all UI/UX decisions. Reference this when building any component.

## Platform Identity

**Workstream** (Q³) is an education-to-employment platform for Ghana. Four distinct portals, one unified design language.

| Portal | Domain | User | Aesthetic |
|--------|--------|------|-----------|
| Student | students.workstream.com | Job candidates | Warm optimism, aspirational |
| Employer | employer.workstream.com | Company HR/execs | Executive efficiency |
| University | university.workstream.com | Admissions staff | Academic prestige + modern |
| Admin | admin.workstream.com | Q³ internal team | Functional density |

---

## Anti-AI-Slop Principles

**FORBIDDEN - Never use:**
- Inter, Roboto, Arial, system-ui fonts
- Purple gradients on white backgrounds
- Space Grotesk (overused by AI)
- Predictable symmetric layouts
- Timid, evenly-distributed color palettes
- Generic card grids with rounded corners
- Bland hero sections with stock imagery

**REQUIRED - Always implement:**
- Distinctive typography pairings
- Bold color with sharp accents
- Intentional motion (staggered reveals)
- At least ONE memorable element per page
- Dark mode support
- Asymmetric or grid-breaking layouts where appropriate

---

## Typography System

### Font Stack

```css
:root {
  /* Display - Headlines, hero text */
  --font-display: 'Satoshi', sans-serif;
  
  /* Body - Readable content */
  --font-body: 'IBM Plex Sans', sans-serif;
  
  /* Mono - Data, IDs, codes */
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Font Loading (Google Fonts)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Note: Satoshi from Fontshare (free):
```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet">
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| display-2xl | 4.5rem (72px) | 700 | 1.1 | Hero headlines |
| display-xl | 3.75rem (60px) | 700 | 1.1 | Page titles |
| display-lg | 3rem (48px) | 700 | 1.2 | Section headers |
| heading-xl | 2.25rem (36px) | 600 | 1.3 | Card titles, major sections |
| heading-lg | 1.875rem (30px) | 600 | 1.3 | Subsections |
| heading-md | 1.5rem (24px) | 600 | 1.4 | Component headers |
| heading-sm | 1.25rem (20px) | 500 | 1.4 | Small headers |
| body-lg | 1.125rem (18px) | 400 | 1.6 | Lead paragraphs |
| body-md | 1rem (16px) | 400 | 1.6 | Default body text |
| body-sm | 0.875rem (14px) | 400 | 1.5 | Secondary text, captions |
| caption | 0.75rem (12px) | 500 | 1.4 | Labels, metadata |

---

## Color System

### Core Palette - "Warm Prosperity"

Inspired by Ghana's warmth, gold coast heritage, and aspirational growth.

```css
:root {
  /* Primary - Deep warm black */
  --color-primary-950: #0a0908;
  --color-primary-900: #1a1814;
  --color-primary-800: #2d2923;
  --color-primary-700: #433d33;
  --color-primary-600: #5c5447;
  --color-primary-500: #78705f;
  
  /* Accent - Warm Gold (prosperity, opportunity) */
  --color-accent-500: #d4a853;
  --color-accent-400: #e0bc6e;
  --color-accent-300: #ebd08e;
  --color-accent-600: #b8913d;
  --color-accent-700: #96752e;
  
  /* Success - Rich Emerald (growth, progress) */
  --color-success-500: #10b981;
  --color-success-400: #34d399;
  --color-success-600: #059669;
  --color-success-700: #047857;
  
  /* Warning - Warm Amber */
  --color-warning-500: #f59e0b;
  --color-warning-400: #fbbf24;
  --color-warning-600: #d97706;
  
  /* Error - Warm Red */
  --color-error-500: #dc2626;
  --color-error-400: #f87171;
  --color-error-600: #b91c1c;
  
  /* Neutral - Warm Grays (not cold) */
  --color-neutral-50: #faf9f7;
  --color-neutral-100: #f5f3f0;
  --color-neutral-200: #e8e4df;
  --color-neutral-300: #d6d0c8;
  --color-neutral-400: #a8a092;
  --color-neutral-500: #7a7265;
  --color-neutral-600: #5c564b;
  --color-neutral-700: #403c34;
  --color-neutral-800: #262420;
  --color-neutral-900: #171614;
  --color-neutral-950: #0d0c0b;
}
```

### Semantic Tokens

```css
:root {
  /* Light Mode */
  --background: var(--color-neutral-50);
  --background-secondary: var(--color-neutral-100);
  --background-tertiary: var(--color-neutral-200);
  
  --foreground: var(--color-primary-900);
  --foreground-secondary: var(--color-neutral-600);
  --foreground-muted: var(--color-neutral-500);
  
  --border: var(--color-neutral-200);
  --border-strong: var(--color-neutral-300);
  
  --accent: var(--color-accent-500);
  --accent-foreground: var(--color-primary-950);
}

.dark {
  --background: var(--color-neutral-950);
  --background-secondary: var(--color-neutral-900);
  --background-tertiary: var(--color-neutral-800);
  
  --foreground: var(--color-neutral-100);
  --foreground-secondary: var(--color-neutral-400);
  --foreground-muted: var(--color-neutral-500);
  
  --border: var(--color-neutral-800);
  --border-strong: var(--color-neutral-700);
  
  --accent: var(--color-accent-400);
  --accent-foreground: var(--color-primary-950);
}
```

---

## Spacing System

Based on 4px grid with intentional jumps.

```css
:root {
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
}
```

---

## Border Radius

```css
:root {
  --radius-sm: 0.375rem;  /* 6px - small elements */
  --radius-md: 0.5rem;    /* 8px - buttons, inputs */
  --radius-lg: 0.75rem;   /* 12px - cards */
  --radius-xl: 1rem;      /* 16px - large cards */
  --radius-2xl: 1.5rem;   /* 24px - feature sections */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

---

## Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Accent glow for CTAs */
  --shadow-accent: 0 0 0 3px var(--color-accent-500 / 0.2);
  --shadow-accent-lg: 0 4px 24px -4px var(--color-accent-500 / 0.3);
}
```

---

## Motion System

### Timing Functions

```css
:root {
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Duration Scale

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
}
```

### Animation Patterns

```css
/* Fade up on load - use with animation-delay for stagger */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide in from left */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-up {
  animation: fadeUp var(--duration-slow) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-spring) forwards;
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  animation: fadeUp var(--duration-slow) var(--ease-out) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 75ms; }
.stagger-children > *:nth-child(3) { animation-delay: 150ms; }
.stagger-children > *:nth-child(4) { animation-delay: 225ms; }
.stagger-children > *:nth-child(5) { animation-delay: 300ms; }
```

---

## Component Patterns

### Buttons

```tsx
// Primary - Bold, warm gold accent
<Button variant="primary">Apply Now</Button>

// Secondary - Outlined
<Button variant="secondary">Learn More</Button>

// Ghost - Minimal
<Button variant="ghost">Cancel</Button>

// Destructive - For dangerous actions
<Button variant="destructive">Delete</Button>
```

Button states must include:
- Hover: Slight scale (1.02) + shadow
- Active: Scale down (0.98)
- Focus: Accent ring
- Disabled: Reduced opacity, no pointer

### Cards

```tsx
// Standard card with warm shadow
<Card>
  <CardHeader>
    <CardTitle>Program Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

Card variations:
- `variant="elevated"` - Shadow + white background
- `variant="outlined"` - Border only
- `variant="filled"` - Subtle background fill

### Form Fields

```tsx
<FormField>
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
  />
  <FormDescription>We'll never share your email.</FormDescription>
  <FormError>Please enter a valid email.</FormError>
</FormField>
```

Input states:
- Default: Subtle border
- Focus: Accent border + glow ring
- Error: Error color border + icon
- Disabled: Muted background

---

## Layout Patterns

### Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { padding: 0 var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--space-8); }
}
```

### Page Structure

```tsx
<div className="min-h-screen bg-background">
  <Navigation />
  <main className="container py-8 md:py-12 lg:py-16">
    {/* Page content */}
  </main>
  <Footer />
</div>
```

### Grid Layouts

```css
/* 3-column responsive grid */
.grid-cards {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .grid-cards { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid-cards { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Portal-Specific Themes

### Student Portal
- Warmer accent tones
- More illustrative elements
- Encouraging microcopy
- Progress indicators prominent
- Mobile-first priority

### Employer Portal
- Cleaner, minimal aesthetic
- Data-dense tables
- Quick action buttons
- Executive summary views
- Time-to-decision optimized

### University Portal
- Academic gravitas
- Structured information hierarchy
- Bulk action capabilities
- Deadline-aware UI
- Collaborative features

### Admin Portal
- Maximum information density
- Tabular data optimization
- System status indicators
- Audit trail visibility
- Power user shortcuts

---

## Icons

Use **Lucide React** exclusively.

```tsx
import { 
  // Navigation
  Home, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Menu, X,
  
  // Actions
  Plus, Minus, Edit, Trash2, Download, Upload, Search, Filter,
  
  // Status
  Check, AlertCircle, Info, Loader2, Clock, Calendar,
  
  // Users
  User, Users, Building2, GraduationCap, Briefcase,
  
  // Content
  FileText, File, Image, Link, Mail, Phone,
  
  // UI
  Sun, Moon, Settings, LogOut, Eye, EyeOff
} from 'lucide-react';
```

Icon sizes:
- sm: `h-4 w-4` (16px)
- md: `h-5 w-5` (20px)
- lg: `h-6 w-6` (24px)

---

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Large phones, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## Accessibility Requirements

- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators: Visible on all interactive elements
- Keyboard navigation: Full support
- Screen reader: Proper ARIA labels
- Reduced motion: Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Structure

```
workstream-client/
├── apps/
│   ├── student/
│   ├── employer/
│   ├── university/
│   └── admin/
├── packages/
│   ├── ui/                    # Shared components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   └── lib/
│   │   │       └── utils.ts
│   │   └── package.json
│   ├── types/                 # Shared TypeScript types
│   └── validators/            # Shared Zod schemas
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Quick Reference

### Do This
- Bold typography choices
- Warm, purposeful color accents
- Staggered entrance animations
- Generous whitespace
- Mobile-first responsive
- Dark mode everywhere

### Don't Do This
- System/generic fonts
- Purple gradients
- Static, lifeless pages
- Cramped layouts
- Desktop-only thinking
- Light mode only
