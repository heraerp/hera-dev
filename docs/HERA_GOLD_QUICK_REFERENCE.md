# 🏆 HERA Gold Theme - Quick Reference

## 🎨 Essential Colors

```scss
// Primary Colors
$primary-teal: #30D5C8;      // Main accent
$background: #1f2937;        // Gray-800 (main bg)
$surface: #374151;           // Gray-700 (cards)
$text-primary: #ffffff;      // White text
$text-secondary: #d1d5db;    // Gray-300
$text-muted: #9ca3af;        // Gray-400
$hover: #4b5563;             // Gray-600
```

## 📱 Component Quick Start

### Navbar + Sidebar Layout
```tsx
import { Navbar } from '@/components/ui/navbar';
import TeamsStyleSidebar from '@/components/ui/TeamsStyleSidebar';

<div className="min-h-screen bg-gray-900">
  <Navbar />
  <div className="flex">
    <TeamsStyleSidebar />
    <main className="flex-1 ml-20 sm:ml-16">
      {children}
    </main>
  </div>
</div>
```

## 🚀 Key Features

### Navbar Features
- ✅ Dark mode toggle (moon/sun icon)
- ✅ Global search with app filtering
- ✅ User profile with role badges
- ✅ Responsive navigation arrows
- ✅ Teams-style design

### Sidebar Features
- ✅ Fixed 80px width (64px mobile)
- ✅ Restaurant navigation (Kitchen, Orders, etc.)
- ✅ Smart apps modal positioning
- ✅ Notification badges
- ✅ Non-expandable design

## 🎯 Restaurant Navigation Items

```typescript
const navItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: ChefHat, label: 'Kitchen', notifications: 3 },
  { icon: Utensils, label: 'Orders', notifications: 7 },
  { icon: Package, label: 'Inventory' },
  { icon: Users, label: 'Staff' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: CreditCard, label: 'Payments' },
  { icon: Calendar, label: 'Bookings' }
];
```

## 📐 Layout Specs

```scss
// Dimensions
.navbar { height: 56px; z-index: 40; }
.sidebar { width: 80px; z-index: 50; }
.apps-modal { 
  width: 384px; 
  max-height: 80vh;
  border-radius: 12px;
}

// Mobile
@media (max-width: 640px) {
  .sidebar { width: 64px; }
  .apps-modal { width: 320px; max-height: 70vh; }
}
```

## 🔧 Common Classes

```scss
// Backgrounds
.bg-primary { background: #1f2937; }
.bg-surface { background: #374151; }
.bg-hover { background: #4b5563; }
.bg-accent { background: #30D5C8; }

// Text
.text-primary { color: #ffffff; }
.text-secondary { color: #d1d5db; }
.text-muted { color: #9ca3af; }
.text-accent { color: #30D5C8; }

// Interactive
.hover-lift:hover { transform: scale(1.02); }
.active-accent { 
  background: rgba(48, 213, 200, 0.2);
  color: #30D5C8;
}
```

## 🛠️ Usage Examples

### Dark Mode Toggle
```tsx
// Already implemented in navbar
<motion.button onClick={toggleDarkMode}>
  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
</motion.button>
```

### Modal Positioning
```tsx
// Smart positioning (already implemented)
const modalPosition = calculateModalPosition();
style={{
  left: `${modalPosition.left}px`,
  top: modalPosition.top
}}
```

### Notification Badge
```tsx
<div className="relative">
  <Icon className="w-5 h-5" />
  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
    {count}
  </span>
</div>
```

## 🎨 App Icon Colors

```typescript
const appColors = {
  pos: 'bg-green-600',
  menu: 'bg-blue-600',
  reservations: 'bg-purple-600',
  chat: 'bg-indigo-600',
  training: 'bg-red-600',
  scheduling: 'bg-orange-600',
  finance: 'bg-teal-600',
  inventory: 'bg-yellow-600',
  support: 'bg-gray-600',
  mobile: 'bg-pink-600'
};
```

## 🔧 Troubleshooting

### Modal Issues
- Check `calculateModalPosition()` function
- Verify screen size detection
- Test on different viewport sizes

### Theme Issues
- Check localStorage for dark mode persistence
- Verify Tailwind classes are applied
- Test theme toggle functionality

### Responsive Issues
- Verify `ml-20 sm:ml-16` for main content
- Check sidebar width classes `w-20 sm:w-16`
- Test on mobile devices

## 📱 Test URLs
- Desktop: `http://localhost:3005/restaurant/dashboard`
- Mobile: Use browser dev tools responsive mode
- Dark Mode: Click moon/sun icon in navbar

---

**🏆 HERA Gold = Gray-800 backgrounds + #30D5C8 teal accents + Teams-style design**