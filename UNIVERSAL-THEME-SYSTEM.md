# HERA Universal Theme System - Mobile-First Design

## 🌟 **Overview**

The HERA Universal Theme System is a comprehensive, mobile-first design system that provides consistent theming across the entire application. It features:

- **Mobile-First Design**: Optimized for touch interfaces with 44px minimum tap targets
- **Dual Theme Support**: Seamless light/dark mode switching with proper contrast
- **CSS Variable Integration**: Consistent theming through CSS custom properties
- **Component System**: Pre-built components that adapt to theme changes
- **Accessibility**: WCAG compliant with proper contrast ratios
- **Performance**: Optimized animations and transitions

## 🎨 **Color System**

### **Light Theme**
```css
--background: #ffffff
--surface: #f8f9fa
--surface-elevated: #ffffff
--text-primary: #1a1a1a
--text-secondary: #666666
--text-muted: #9ca3af
--border: #e5e7eb
--orange-primary: #FF4701
--success: #16a34a
--warning: #ca8a04
--error: #dc2626
```

### **Dark Theme**
```css
--background: #1a1a1a
--surface: #232323
--surface-elevated: #2a2a2a
--text-primary: #F1F1F1
--text-secondary: #A8A9AD
--text-muted: #6b7280
--border: #292023
--orange-primary: #FF4701
--success: #4ade80
--warning: #fbbf24
--error: #f87171
```

## 📱 **Mobile-First Components**

### **1. UniversalThemeButton**

```tsx
import { UniversalThemeButton, ThemeToggleButton } from '@/components/theme/UniversalThemeButton';

// Primary button
<UniversalThemeButton variant="primary" onClick={handleClick}>
  Save Changes
</UniversalThemeButton>

// Secondary button
<UniversalThemeButton variant="secondary" icon={<Plus />}>
  Add Item
</UniversalThemeButton>

// Theme toggle button
<ThemeToggleButton />
```

**Features:**
- Touch-friendly 44px minimum height
- Smooth animations and hover effects
- Loading states with spinner
- Disabled states with proper opacity
- Icon support with consistent spacing

### **2. UniversalCard**

```tsx
import { UniversalCard, UniversalCardHeader, UniversalCardTitle } from '@/components/theme/UniversalCard';

<UniversalCard variant="elevated">
  <UniversalCardHeader>
    <UniversalCardTitle>Card Title</UniversalCardTitle>
  </UniversalCardHeader>
  <UniversalCardContent>
    Card content goes here
  </UniversalCardContent>
</UniversalCard>
```

**Variants:**
- `default`: Basic card with border
- `elevated`: Card with shadow elevation
- `interactive`: Hover effects for clickable cards

### **3. UniversalInput**

```tsx
import { UniversalInput, UniversalSearchInput } from '@/components/theme/UniversalInput';

// Standard input
<UniversalInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={handleChange}
  error={error}
  required
/>

// Search input
<UniversalSearchInput
  placeholder="Search items..."
  value={searchQuery}
  onChange={handleSearch}
/>
```

**Features:**
- Mobile-optimized touch targets
- Password visibility toggle
- Error state handling
- Icon support
- Animated focus states

## 🎭 **Theme Hook Usage**

### **useMobileTheme Hook**

```tsx
import { useMobileTheme } from '@/hooks/useMobileTheme';

const MyComponent = () => {
  const { colors, getButtonStyles, isDark, toggleTheme } = useMobileTheme();
  
  return (
    <div style={{ backgroundColor: colors.surface }}>
      <button
        style={getButtonStyles('primary')}
        onClick={toggleTheme}
      >
        Toggle Theme
      </button>
    </div>
  );
};
```

**Available Methods:**
- `colors`: Complete color palette
- `getButtonStyles(variant)`: Button styling
- `getCardStyles(variant)`: Card styling
- `getInputStyles(focused)`: Input styling
- `getBadgeStyles(variant)`: Badge styling
- `getTapTargetStyles()`: Touch-friendly targets
- `getResponsiveSpacing(size)`: Responsive spacing
- `getResponsiveText(size)`: Responsive typography

## 🏗️ **CSS Class System**

### **Component Classes**

```css
/* Cards */
.hera-card              /* Basic card */
.hera-card-elevated     /* Elevated card */
.hera-card-interactive  /* Interactive card */

/* Buttons */
.hera-btn              /* Base button */
.hera-btn-primary      /* Primary button */
.hera-btn-secondary    /* Secondary button */
.hera-btn-ghost        /* Ghost button */

/* Inputs */
.hera-input            /* Standard input */

/* Badges */
.hera-badge            /* Base badge */
.hera-badge-success    /* Success badge */
.hera-badge-warning    /* Warning badge */
.hera-badge-error      /* Error badge */

/* Typography */
.hera-heading-1        /* Large heading */
.hera-heading-2        /* Medium heading */
.hera-heading-3        /* Small heading */
.hera-body             /* Body text */
.hera-caption          /* Caption text */

/* Layout */
.hera-container        /* Responsive container */
.hera-section          /* Section spacing */
.hera-grid             /* Grid layout */
.hera-flex             /* Flex layout */
```

### **Utility Classes**

```css
/* Mobile-specific */
.mobile-only           /* Show only on mobile */
.desktop-only          /* Show only on desktop */
.tablet-up             /* Show on tablet and up */
.hera-tap-target       /* Touch-friendly target */

/* Theme utilities */
.theme-surface         /* Surface background */
.theme-text-primary    /* Primary text color */
.theme-text-secondary  /* Secondary text color */
.theme-border          /* Border color */
.theme-orange          /* Orange accent color */

/* Spacing */
.hera-space-xs         /* Extra small spacing */
.hera-space-sm         /* Small spacing */
.hera-space-md         /* Medium spacing */
.hera-space-lg         /* Large spacing */
.hera-space-xl         /* Extra large spacing */
```

## 🔧 **Integration Guide**

### **1. Wrap Your App**

```tsx
// app/layout.tsx
import { UniversalThemeWrapper } from '@/components/theme/UniversalThemeWrapper';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <UniversalThemeWrapper>
            {children}
          </UniversalThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}
```

### **2. Use Theme Components**

```tsx
// pages/example.tsx
import { UniversalCard, UniversalThemeButton } from '@/components/theme';
import { useMobileTheme } from '@/hooks/useMobileTheme';

const ExamplePage = () => {
  const { colors, isDark } = useMobileTheme();
  
  return (
    <div className="hera-container hera-section">
      <UniversalCard variant="elevated">
        <h1 className="hera-heading-1">Welcome to HERA</h1>
        <p className="hera-body">
          This is an example of the universal theme system in action.
        </p>
        <UniversalThemeButton variant="primary">
          Get Started
        </UniversalThemeButton>
      </UniversalCard>
    </div>
  );
};
```

### **3. Custom Components**

```tsx
// Custom component with theme support
const CustomComponent = () => {
  const { colors, getResponsiveText } = useMobileTheme();
  
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.textPrimary,
      }}
    >
      <h2 style={getResponsiveText('xl')}>Custom Component</h2>
      <p style={{ color: colors.textSecondary }}>
        This component uses the theme system for consistent styling.
      </p>
    </div>
  );
};
```

## 📱 **Mobile-First Principles**

### **Touch Targets**
- Minimum 44px height for all interactive elements
- Adequate spacing between touch targets
- Visual feedback for touch interactions

### **Typography Scale**
- Mobile-optimized font sizes
- Responsive scaling based on screen size
- Proper line heights for readability

### **Spacing System**
- Consistent spacing scale: xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- Mobile-first responsive spacing
- Touch-friendly padding and margins

### **Performance**
- Optimized animations for mobile devices
- Smooth 60fps transitions
- Reduced motion support for accessibility

## 🔍 **Accessibility Features**

### **WCAG Compliance**
- **AA Rating**: 4.5:1 minimum contrast ratio
- **AAA Rating**: 7:1 contrast ratio for important text
- Proper focus indicators
- Screen reader support

### **Keyboard Navigation**
- Tab order management
- Focus trapping in modals
- Escape key handling

### **Color Accessibility**
- High contrast mode support
- Color-blind friendly palette
- Semantic color meanings

## 🚀 **Performance Optimizations**

### **CSS Variables**
- Efficient theme switching
- Minimal style recalculation
- Cached color values

### **Component Optimization**
- Memoized style calculations
- Lazy loading of theme utilities
- Minimal re-renders on theme change

### **Animation Performance**
- GPU-accelerated transforms
- Reduced motion preferences
- Optimized transition timing

## 🎯 **Best Practices**

### **Do's**
- ✅ Use theme components for consistency
- ✅ Follow mobile-first design principles
- ✅ Test in both light and dark modes
- ✅ Ensure proper contrast ratios
- ✅ Use semantic color meanings

### **Don'ts**
- ❌ Don't hardcode colors in components
- ❌ Don't ignore mobile touch targets
- ❌ Don't use animations without reduced motion support
- ❌ Don't break accessibility standards
- ❌ Don't override theme colors without reason

## 📊 **Browser Support**

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **CSS Features**: CSS Custom Properties, CSS Grid, Flexbox
- **JavaScript**: ES2020 features, React 18+

## 🔄 **Migration Guide**

### **From Old System**
1. Replace hardcoded colors with theme variables
2. Update component imports to use universal components
3. Add theme provider wrapping
4. Test all components in both themes
5. Update styling to use CSS classes

### **Example Migration**
```tsx
// Before
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click Me
</button>

// After
<UniversalThemeButton variant="primary">
  Click Me
</UniversalThemeButton>
```

## 🎉 **Conclusion**

The HERA Universal Theme System provides a robust, mobile-first foundation for building consistent, accessible, and performant user interfaces. By following these guidelines and using the provided components, you'll create a cohesive user experience across all devices and themes.

For questions or contributions, please refer to the team documentation or create an issue in the project repository.