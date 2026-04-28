# Component Examples: Before & After

## Overview
This file shows concrete examples of how the premium design system transforms your components. All code examples are ready to use.

---

## 1. Buttons

### Before
```tsx
<Button variant="default">
  Click Me
</Button>
```
**Old Style**: Flat, generic appearance

### After
```tsx
<Button variant="default">
  Click Me
</Button>
```
**New Style**: 
- Background: Indigo #4F46E5
- Hover: Deeper Indigo #4338CA with lift effect
- Shadow: Subtle → Enhanced on hover
- Typography: Font-weight 600, rounded-lg (8px)
- Transitions: Smooth 0.2s ease-in-out

### All Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="premium">Premium (Gradient)</Button>
```

---

## 2. Cards

### Before
```tsx
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```
**Old Style**: Flat border, generic shadow

### After
```tsx
<Card className="premium-card">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```
**New Style**:
- Background: Pure white #FFFFFF
- Border: None (uses shadow instead)
- Border-radius: rounded-xl (12px)
- Shadow: Soft `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`
- Hover: Lift with enhanced shadow
- Header: Has bottom border for visual separation

---

## 3. Input Fields

### Before
```tsx
<Input 
  type="email" 
  placeholder="Enter email"
/>
```
**Old Style**: Basic input with standard border

### After
```tsx
<Input 
  type="email" 
  placeholder="Enter email"
/>
```
**New Style**:
- Background: White #FFFFFF
- Border: 2px solid #E2E8F0 (light gray)
- Border-radius: rounded-lg (8px)
- Padding: py-2.5 px-4 (comfortable spacing)
- Placeholder: #94A3B8 (muted slate)
- Focus: 2px ring of #4F46E5, transparent border
- Transition: All 0.2s ease-in-out

### Advanced Input Example
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="you@example.com"
    className="input-focus"
  />
</div>
```

---

## 4. Labels

### Before
```tsx
<Label>Email</Label>
```
**Old Style**: Generic gray text

### After
```tsx
<Label htmlFor="email">Email Address</Label>
```
**New Style**:
- Font: Inter 14px
- Weight: 600 (semibold)
- Color: #1E293B (slate 800)
- Accessible: Linked to input via htmlFor

---

## 5. Status Badges (Pills)

### Before
```tsx
<Badge variant="default">HIGH</Badge>
```
**Old Style**: Rounded pill with solid background

### After
```tsx
<Badge variant="critical">CRITICAL</Badge>
<Badge variant="high">HIGH</Badge>
<Badge variant="medium">MEDIUM</Badge>
<Badge variant="low">LOW</Badge>
<Badge variant="success">SUCCESS</Badge>
<Badge variant="warning">WARNING</Badge>
```

**New Style**:
- Shape: 9999px border-radius (perfect pill)
- Background: 10% opacity of status color
- Text: 100% solid status color
- Font: Font-weight 600, 12px
- Variants Available:
  ```
  critical    → Red BG (#red-100) + Red text (#EF4444)
  high        → Amber BG (#amber-100) + Amber text (#F59E0B)
  medium      → Amber BG + Amber text
  low         → Emerald BG (#emerald-100) + Emerald text (#10B981)
  success     → Emerald BG + Emerald text
  warning     → Amber BG + Amber text
  pending     → Indigo BG (#indigo-100) + Indigo text (#4F46E5)
  ```

### Usage in Tables
```tsx
<table className="w-full">
  <tbody>
    {items.map((item) => (
      <tr key={item.id} className="border-b border-[#E2E8F0]">
        <td className="py-3 px-4">{item.name}</td>
        <td className="py-3 px-4">
          <Badge variant={item.priorityVariant}>
            {item.priority.toUpperCase()}
          </Badge>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 6. Dashboard Layout

### Before
```tsx
<div className="flex min-h-screen bg-background">
  <aside className="sticky top-0 flex h-screen flex-col border-r bg-card">
    {/* Sidebar Content */}
  </aside>
  <div className="flex flex-1 flex-col">
    <header className="sticky top-0 border-b bg-card/80">
      {/* Header Content */}
    </header>
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  </div>
</div>
```
**Old Style**: Light sidebar, generic header

### After
```tsx
<div className="flex min-h-screen bg-[#F8FAFC]">
  {/* Premium Dark Sidebar */}
  <aside className="sidebar-premium sticky top-0 flex h-screen flex-col">
    {/* Logo with Gradient */}
    <div className="flex h-16 items-center gap-3 border-b border-[#1E293B] px-4">
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] shadow-lg">
        <Logo />
      </div>
      <span className="font-heading text-xl font-800 text-[#F8FAFC]">SamarthAI</span>
    </div>

    {/* Navigation with Active State */}
    <nav className="flex-1">
      {links.map((link) => (
        <NavLink
          className="sidebar-item-hover text-[#CBD5E1]"
          activeClassName="sidebar-item-active"
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>

  {/* Main Content */}
  <div className="flex flex-1 flex-col">
    {/* Premium Header */}
    <header className="border-b border-[#E2E8F0] bg-white px-8">
      <h2 className="font-heading text-2xl font-700 text-[#1E293B]">Dashboard</h2>
      <div className="flex items-center gap-6">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5">
          <span className="text-xs font-600 text-[#1E293B]">{userRole}</span>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </header>

    {/* Content Area */}
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
      <Outlet />
    </main>
  </div>
</div>
```

**New Style**:
- **Sidebar**: Dark #0F172A with light text for framing
- **Navigation**: Hover states with #1E293B background
- **Active Items**: Left 4px Indigo border
- **Header**: White background with subtle border
- **Content Area**: Slate 50 background for content focus
- **Logo**: Gradient Indigo for visual appeal
- **Spacing**: Generous padding & gaps

---

## 7. Form Examples

### Login Form
```tsx
<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-center">Sign In to SamarthAI</CardTitle>
      <CardDescription className="text-center">
        Enter your credentials to access the dashboard
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email"
          type="email" 
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          type="password" 
          placeholder="••••••••"
          required
        />
      </div>
      <Button className="w-full" variant="default">
        Sign In
      </Button>
    </CardContent>
  </Card>
</div>
```

### Emergency Registration Form
```tsx
<Card className="premium-card">
  <CardHeader>
    <CardTitle>Report Emergency</CardTitle>
    <CardDescription>
      Provide details about the emergency situation
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="City, Region" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="people">People Affected</Label>
        <Input id="people" type="number" placeholder="0" />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <textarea 
        id="description"
        placeholder="Describe the emergency..."
        className="w-full rounded-lg border-2 border-[#E2E8F0] p-3"
        rows={4}
      />
    </div>

    <div className="space-y-2">
      <Label>Priority Level</Label>
      <div className="flex gap-2">
        <Badge variant="low">Low</Badge>
        <Badge variant="medium">Medium</Badge>
        <Badge variant="high">High</Badge>
        <Badge variant="critical">Critical</Badge>
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button variant="default">Submit Report</Button>
  </CardFooter>
</Card>
```

---

## 8. Dashboard Cards with Stats

### Statistics Card
```tsx
<Card className="premium-card">
  <CardContent className="pt-6">
    <div className="space-y-2">
      <p className="text-sm font-600 text-[#64748B]">Active Emergencies</p>
      <p className="text-4xl font-bold font-heading" style={{fontWeight: 800}}>
        24
      </p>
      <p className="text-xs text-[#64748B]">+12% from last week</p>
    </div>
  </CardContent>
</Card>
```

### Status Overview Card
```tsx
<Card className="premium-card">
  <CardHeader>
    <CardTitle>Response Status</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-500 text-[#1E293B]">Responded</span>
      <Badge variant="success">18</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-500 text-[#1E293B]">In Progress</span>
      <Badge variant="pending">5</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-500 text-[#1E293B]">Critical</span>
      <Badge variant="critical">1</Badge>
    </div>
  </CardContent>
</Card>
```

---

## 9. Utility Classes

### Text Colors
```tsx
<p className="text-slate-50">Light text</p>
<p className="text-slate-500">Muted text</p>
<p className="text-slate-800">Primary text</p>
<p className="text-slate-900">Very dark text</p>
<p className="text-indigo">Brand color text</p>
```

### Shadows
```tsx
<div className="shadow-premium-sm">Minimal shadow</div>
<div className="shadow-premium">Card shadow</div>
<div className="shadow-premium-lg">Enhanced shadow</div>
<div className="shadow-premium-xl">Extra emphasis</div>
```

### Animations
```tsx
<div className="animation-fade-in">Fade in effect</div>
<div className="animation-slide-in">Slide in effect</div>
<div className="hover-lift">Lifts on hover</div>
```

---

## 10. Responsive Layout

### Mobile-First Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="premium-card">Content</Card>
  <Card className="premium-card">Content</Card>
  <Card className="premium-card">Content</Card>
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">
  Responsive Heading
</h1>
```

### Responsive Padding
```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding content
</div>
```

---

## 11. Accessibility

### Focus States
All components automatically have focus ring styling:
```tsx
<Button>Button</Button>  {/* Automatic focus ring on :focus-visible */}
<Input />              {/* Automatic focus ring on focus */}
```

### Label Association
```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

### Semantic HTML
```tsx
<table className="w-full">
  <thead className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
    <tr>
      <th className="text-left p-3">Name</th>
      <th className="text-left p-3">Status</th>
    </tr>
  </thead>
  <tbody>
    {/* Rows here */}
  </tbody>
</table>
```

---

## Key Takeaways

1. **Button Components**: Use variant prop to get premium styling
2. **Cards**: Add `premium-card` class for hover lift
3. **Inputs**: Use Input component directly; focus ring is automatic
4. **Labels**: Always link to inputs with htmlFor
5. **Badges**: Use variant prop for status colors
6. **Colors**: Reference exact hex values from design system
7. **Typography**: Use font-heading for headings, font-body for content
8. **Spacing**: Use Tailwind scale (p-4, gap-3, etc.)
9. **Shadows**: Use predefined shadow classes
10. **Animations**: Built-in with hover states

All components work together seamlessly following the unified design system. For more details, refer to `DESIGN_SYSTEM.md`.
