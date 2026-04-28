# SamarthAI Premium Design System Documentation

## Overview
The SamarthAI disaster management dashboard has been overhauled with a premium, modern design system implemented through Tailwind CSS, Google Fonts, and custom components. This document outlines the complete design specifications and usage guidelines.

---

## 1. Typography System

### Font Families
- **Primary Font (Headings, Display, Numbers)**: `Plus Jakarta Sans` (400, 500, 600, 700, 800)
  - Used for: H1-H6 headings, prominent statistics, display text
  - Font weights: 700 for regular headings, 800 for prominent numbers/display

- **Secondary Font (Body, Tables, Inputs)**: `Inter` (400, 500, 600, 700)
  - Used for: Body text, form inputs, table content, labels
  - Font weights: 400 for regular text, 500-600 for medium emphasis, 700 for bold labels

### Font Sizes & Weights
```
h1 → 2.25rem (36px), weight 800
h2 → 1.875rem (30px), weight 800
h3 → 1.5rem (24px), weight 700
h4 → 1.25rem (20px), weight 700
h5 → 1.125rem (18px), weight 600
h6 → 1rem (16px), weight 600
body → 1rem (16px), weight 400
label → 0.875rem (14px), weight 600
```

---

## 2. Global Color Palette

### Primary Palette
| Name | Hex | Usage |
|------|-----|-------|
| **Slate 50** | `#F8FAFC` | App Background |
| **Slate 500** | `#64748B` | Secondary Text, Muted Content |
| **Slate 800** | `#1E293B` | Primary Text, Foreground |
| **Slate 900** | `#0F172A` | Sidebar Background (Dark) |
| **Indigo 500** | `#4F46E5` | Primary Brand Color, Links, Active States |
| **Indigo 600** | `#4338CA` | Hover State for Indigo |

### Status Colors
| Status | Hex | Usage |
|--------|-----|-------|
| **Success / Emerald** | `#10B981` | Success messages, positive indicators |
| **Warning / Amber** | `#F59E0B` | Warning alerts, caution notices |
| **Critical / Crimson** | `#EF4444` | Errors, critical alerts, destructive actions |

### Supporting Palette
| Element | Hex | Usage |
|---------|-----|-------|
| **Surface/Card** | `#FFFFFF` | Card backgrounds, containers |
| **Border** | `#E2E8F0` | Input borders, dividers |
| **Input** | `#FFFFFF` | Input field backgrounds |

---

## 3. Component Architecture

### Cards & Containers
```css
/* Specifications */
Background:    #FFFFFF (Pure White)
Border-radius: 12px (0.75rem)
Box-shadow:    0 4px 6px -1px rgba(0, 0, 0, 0.05), 
               0 2px 4px -1px rgba(0, 0, 0, 0.03)
Hover Shadow:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 10px 10px -5px rgba(0, 0, 0, 0.04)
Hover Effect:  transform: translateY(-2px)
```

**React Component Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card className="premium-card">
  <CardHeader>
    <CardTitle>Dashboard Title</CardTitle>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
</Card>
```

### Input Fields
```css
/* Specifications */
Background:        #FFFFFF (Pure White)
Border:            2px solid #E2E8F0
Border-radius:     8px (0.5rem)
Padding:           12px 16px (py-2.5 px-4)
Focus Ring:        2px ring of #4F46E5
Focus Behavior:    Remove border on focus, add ring
Placeholder Color: #94A3B8
```

**React Component Usage:**
```tsx
import { Input } from "@/components/ui/input";

<Input 
  type="email" 
  placeholder="Enter your email"
  className="input-focus"
/>
```

### Primary Buttons
```css
/* Specifications */
Background:    #4F46E5 (Indigo)
Hover:         #4338CA (Indigo Dark)
Text Color:    #FFFFFF (White)
Border-radius: 8px
Font-weight:   600 or 700
Padding:       10px 16px (h-10 px-4)
Shadow:        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
Hover Effect:  
  - transform: translateY(-2px)
  - shadow-md applied
  - bg-color deepens to #4338CA
Transition:    all 0.2s ease-in-out
```

**React Component Usage:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Click Me
</Button>

<Button variant="premium">Premium Button</Button>
```

### Button Variants
```
1. default      → Indigo background, white text
2. destructive  → Red background, white text
3. outline      → Border + light background
4. secondary    → Light gray background
5. ghost        → No background, indigo text
6. link         → Text link with underline
7. premium      → Gradient indigo background
```

### Status Badges (Pills)
```css
/* Specifications */
Shape:           border-radius: 9999px (fully rounded pill)
Padding:         4px 12px (px-3 py-1.5)
Font-size:       0.75rem
Font-weight:     700 (bold)
Background:      10% opacity of status color
Text Color:      100% solid status color
```

**Color Examples:**
| Status | Background | Text Color |
|--------|------------|-----------|
| Critical | `rgba(239, 68, 68, 0.1)` | `#EF4444` |
| High | `rgba(245, 158, 11, 0.1)` | `#F59E0B` |
| Medium | `rgba(245, 158, 11, 0.1)` | `#F59E0B` |
| Low | `rgba(16, 185, 129, 0.1)` | `#10B981` |

**React Component Usage:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="critical">CRITICAL</Badge>
<Badge variant="high">HIGH</Badge>
<Badge variant="success">SUCCESS</Badge>
<Badge variant="warning">WARNING</Badge>
```

---

## 4. Hover States & Animations

### Global Transitions
All interactive elements have a smooth 0.2s ease-in-out transition:
```css
transition: all 0.2s ease-in-out;
```

### Hover Lift Effect
Cards and buttons lift up on hover with improved shadow:
```css
transform: translateY(-2px);
box-shadow: enhanced shadow-lg or shadow-xl;
```

### Focus Rings
All focusable elements (buttons, inputs, links) display:
```css
outline: 2px solid #4F46E5;
outline-offset: 2px;
```

### Active States
Buttons compress down on click:
```css
transform: scale(0.95);
```

---

## 5. Sidebar Styling (Dark Navigation Frame)

### Sidebar Container
```css
Background: #0F172A (Slate 900 - Dark)
Text Color: #F8FAFC (Slate 50 - Light)
Border:     1px solid #1E293B
Width:      Collapsible (w-64 expanded, w-16 collapsed)
```

### Navigation Items
```css
/* Idle State */
Color: #CBD5E1 (light gray)

/* Hover State */
Background: #1E293B
Color: #F8FAFC
Transition: 0.2s ease-in-out

/* Active State */
Background: #1E293B
Left Border: 4px solid #4F46E5 (Indigo accent)
Color: #F8FAFC
Font-weight: 500+
```

**React Component:**
```tsx
/* From DashboardLayout.tsx */
<aside className="sidebar-premium sticky top-0 flex h-screen flex-col">
  {/* Navigation items with NavLink component */}
  <NavLink
    to="/dashboard"
    className="sidebar-item-hover"
    activeClassName="sidebar-item-active"
  >
    <Icon /> Label
  </NavLink>
</aside>
```

---

## 6. Label & Form Typography

### Label Styling
```css
Font-size:   0.875rem (14px)
Font-weight: 600 (semibold)
Color:       #1E293B (Slate 800)
Family:      Inter
```

**React Component Usage:**
```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

## 7. Utility Classes

### Text Colors
```
.text-slate-50   → #F8FAFC
.text-slate-500  → #64748B
.text-slate-800  → #1E293B
.text-slate-900  → #0F172A
.text-indigo     → #4F46E5
```

### Shadows
```
.shadow-premium-sm  → 0 1px 2px 0 rgba(0, 0, 0, 0.05)
.shadow-premium     → 0 4px 6px -1px rgba(0, 0, 0, 0.05), ...
.shadow-premium-lg  → 0 20px 25px -5px rgba(0, 0, 0, 0.1), ...
.shadow-premium-xl  → Premium indigo-tinted shadow
```

### Animations
```
.animation-fade-in  → Fade in with translateY
.animation-slide-in → Slide in from left
.hover-lift         → Lift effect on hover
```

---

## 8. Global App Layout

The app follows a two-column layout:

```
┌─────────────────────────────────────────┐
│  Dark Sidebar (Slate 900)   | Header    │
│  - Logo                     | (White)   │
│  - Navigation               │           │
│  - Collapse Toggle          │           │
├─────────────────────────────┤           │
│                             │           │
│  Main Content Area          │           │
│  (Slate 50 Background)      │           │
│                             │           │
│  Cards with white bg        │           │
│  Premium shadows            │           │
│                             │           │
└─────────────────────────────────────────┘
```

---

## 9. Usage Examples

### Form Page (Auth)
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" variant="default">
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Dashboard Card
```tsx
<Card className="premium-card">
  <CardHeader>
    <CardTitle>Emergency Response</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <p className="text-sm text-[#64748B]">Status</p>
        <Badge variant="critical">ACTIVE</Badge>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-[#64748B]">Priority</p>
        <Badge variant="high">HIGH</Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

### Status Table with Badges
```tsx
<table className="w-full">
  <tbody>
    {items.map((item) => (
      <tr key={item.id} className="border-b border-[#E2E8F0]">
        <td className="py-3 px-4 text-[#1E293B]">{item.name}</td>
        <td className="py-3 px-4">
          <Badge 
            variant={
              item.urgency === 'critical' ? 'critical' :
              item.urgency === 'high' ? 'high' :
              'success'
            }
          >
            {item.urgency.toUpperCase()}
          </Badge>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 10. Best Practices

1. **Always use Tailwind classes**: Avoid inline styles. Use predefined classes from the design system.
2. **Maintain spacing consistency**: Use Tailwind's spacing scale (px-4, py-6, gap-4, etc.)
3. **Font usage**: Use `font-heading` for headings, `font-body` for body text
4. **Color consistency**: Reference hex values only from the color palette above
5. **Hover effects**: Apply `hover-lift` class or use direct hover utilities
6. **Shadows**: Use `.shadow-card` for cards, `.shadow-premium-lg` for emphasis
7. **Transitions**: All interactive elements already have smooth transitions - don't override
8. **Focus states**: Rely on built-in focus-visible styling - inputs and buttons handle this automatically
9. **Responsive design**: Mobile-first approach using Tailwind breakpoints (sm:, md:, lg:, etc.)
10. **Badges**: Always use rounded pills with variant props for status indicators

---

## 11. Tailwind Configuration

All design system values are configured in `tailwind.config.ts`:
- Color palette with hex values
- Box-shadow definitions
- Border radius specifications
- Font family extensions
- Custom keyframes for animations

---

## 12. Support & Maintenance

- **Global CSS**: `/src/index.css`
- **Component Styles**: Check individual component files in `/src/components/ui/`
- **Config**: `/tailwind.config.ts`
- **App Styles**: `/src/App.css`

For questions or updates to the design system, refer to this documentation and the actual Tailwind config file.

---

**Version**: 1.0  
**Last Updated**: April 28, 2026  
**Design System**: Premium SamarthAI v1
