# 🏆 HERA Gold Theme - Complete Design System Documentation

## 🎯 Overview

**HERA Gold Theme** is the unified design system for HERA's restaurant management platform, featuring a sophisticated dark theme with teal (#30D5C8) accents that provides a modern, professional Microsoft Teams-inspired interface.

## 🎨 Color Palette

### Primary Colors
```scss
// HERA Gold Theme Colors
$primary-teal: #30D5C8;           // Main accent color (buttons, highlights, active states)
$background-dark: #1f2937;       // Main background (gray-800)
$surface-dark: #374151;          // Cards and elevated surfaces (gray-700)
$sidebar-dark: #1f2937;          // Sidebar background (gray-800)
$navbar-dark: #1f2937;           // Navbar background (gray-800)

// Text Colors
$text-primary: #ffffff;          // Primary text on dark backgrounds
$text-secondary: #d1d5db;        // Secondary text (gray-300)
$text-muted: #9ca3af;            // Muted text and placeholders (gray-400)

// Interactive States
$hover-surface: #4b5563;         // Hover states (gray-600)
$active-teal: rgba(48, 213, 200, 0.2); // Active state background
$focus-ring: rgba(48, 213, 200, 0.5);  // Focus ring color

// Status Colors
$success: #10b981;               // Success states (green-500)
$warning: #f59e0b;               // Warning states (yellow-500)
$error: #ef4444;                 // Error states (red-500)
$info: #3b82f6;                  // Info states (blue-500)
```

### Gradient Combinations
```scss
// HERA Gold Gradients
$gradient-primary: linear-gradient(135deg, #30D5C8 0%, #2dd4bf 100%);
$gradient-surface: linear-gradient(135deg, #374151 0%, #4b5563 100%);
$gradient-backdrop: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%);
```

---

## 📱 Component Architecture

### 1. HERA Gold Navbar (`/components/ui/navbar.tsx`)

#### Features
- **Teams-Style Design**: Modern Microsoft Teams-inspired interface
- **Comprehensive Search**: Global search with app filtering and recent apps
- **Dark Mode Toggle**: Moon/Sun icon toggle in top-right corner
- **User Management**: Complete user profile dropdown with role badges
- **Responsive Design**: Mobile-first approach with proper scaling

#### Key Props & Configuration
```typescript
interface NavbarProps {
  restaurantData?: {
    businessName: string;
    organizationId: string;
  };
  userInfo?: {
    authUser: any;
    coreUser: any;
    organizations: any[];
    currentRole: string;
  };
}
```

#### Visual Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [◀◁] Restaurant Name    [🔍 Search Bar]    [🌙][🔔][👤▼] │
└─────────────────────────────────────────────────────────────────┘
```

#### Color Implementation
```scss
// Navbar Styling
.navbar-hera-gold {
  background: #1f2937; // gray-800
  border-bottom: 1px solid #374151; // gray-700
  
  .search-bar {
    background: #374151; // gray-700
    &:focus {
      background: #4b5563; // gray-600
      ring: 2px solid rgba(48, 213, 200, 0.5);
    }
  }
  
  .dark-mode-toggle {
    color: #9ca3af; // gray-400
    &:hover {
      color: #ffffff;
      background: #374151; // gray-700
    }
  }
  
  .user-profile {
    .role-badge {
      background: #374151; // gray-700
      color: #d1d5db; // gray-300
    }
    
    .avatar {
      background: #30D5C8; // primary teal
    }
  }
}
```

---

### 2. HERA Gold Sidebar (`/components/ui/TeamsStyleSidebar.tsx`)

#### Features
- **Fixed 80px Width**: Non-expandable, space-efficient design
- **Restaurant-Focused Navigation**: Kitchen, Orders, Inventory, Staff, etc.
- **Intelligent Apps Modal**: Dynamic positioning that stays on-screen
- **Notification Badges**: Real-time notification counts
- **Mobile Responsive**: Scales to 64px on mobile devices

#### Key Props & Configuration
```typescript
interface TeamsStyleSidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  icon: React.ElementType;
  label: string;
  hasNotifications?: boolean;
  notificationCount?: number;
  isActive?: boolean;
}
```

#### Visual Structure
```
┌────┐
│🏠 │ Dashboard
│    │
│👨‍🍳 │ Kitchen (3)
│    │
│🍽️ │ Orders (7)
│    │
│📦 │ Inventory
│    │
│👥 │ Staff
│    │
│📊 │ Analytics
│    │
│💳 │ Payments
│    │
│📅 │ Bookings
├────┤
│⋯  │ Apps
├────┤
│⚙️ │ Settings
└────┘
```

#### Apps Modal Positioning System
```typescript
// Smart Modal Positioning
const calculateModalPosition = () => {
  const sidebarWidth = window.innerWidth >= 640 ? 80 : 64;
  const modalWidth = window.innerWidth >= 640 ? 384 : 320;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Horizontal positioning
  let leftPosition = sidebarWidth + 16;
  if (leftPosition + modalWidth > screenWidth) {
    leftPosition = Math.max(16, screenWidth - modalWidth - 16);
  }
  
  // Vertical positioning
  let topPosition = '50%';
  const modalHeight = 600;
  if (screenHeight < modalHeight + 80) {
    topPosition = '20px';
  }
  
  return { left: leftPosition, top: topPosition };
};
```

#### Color Implementation
```scss
// Sidebar Styling
.sidebar-hera-gold {
  background: #1f2937; // gray-800
  width: 80px; // Fixed width
  
  .nav-item {
    color: #d1d5db; // gray-300
    
    &:hover {
      background: #374151; // gray-700
      color: #ffffff;
    }
    
    &.active {
      background: rgba(48, 213, 200, 0.2);
      color: #30D5C8;
    }
    
    .notification-badge {
      background: #ef4444; // red-500
      color: #ffffff;
    }
  }
  
  .apps-modal {
    background: #1f2937; // gray-800
    border: 1px solid #4b5563; // gray-600
    
    .search-input {
      background: rgba(55, 65, 81, 0.5); // gray-700/50
      border: 1px solid #4b5563; // gray-600
      
      &:focus {
        ring: 2px solid rgba(48, 213, 200, 0.5);
      }
    }
    
    .app-icon {
      &.pos { background: #10b981; } // green-600
      &.menu { background: #3b82f6; } // blue-600
      &.reservations { background: #8b5cf6; } // purple-600
      &.chat { background: #6366f1; } // indigo-600
      &.training { background: #ef4444; } // red-600
      &.scheduling { background: #f59e0b; } // orange-600
      &.finance { background: #30D5C8; } // teal-600
      &.inventory { background: #eab308; } // yellow-600
      &.support { background: #6b7280; } // gray-600
      &.mobile { background: #ec4899; } // pink-600
    }
  }
}
```

---

## 🚀 Implementation Guide

### Quick Start
```tsx
// 1. Import the components
import { Navbar } from '@/components/ui/navbar';
import TeamsStyleSidebar from '@/components/ui/TeamsStyleSidebar';

// 2. Basic Layout Structure
export default function RestaurantLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex">
        <TeamsStyleSidebar />
        <main className="flex-1 ml-20 sm:ml-16">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Dark Mode Integration
```typescript
// Dark mode state management (already in navbar)
const [darkMode, setDarkMode] = useState(false);

const toggleDarkMode = () => {
  const newDarkMode = !darkMode;
  setDarkMode(newDarkMode);
  localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  
  if (newDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```

---

## 📐 Layout Specifications

### Navbar Dimensions
- **Height**: 56px (h-14)
- **Background**: Gray-800 (#1f2937)
- **Border**: Bottom 1px Gray-700 (#374151)
- **Z-index**: 40

### Sidebar Dimensions
- **Width**: 80px desktop, 64px mobile
- **Background**: Gray-800 (#1f2937)
- **Position**: Fixed left
- **Z-index**: 50

### Apps Modal Dimensions
- **Width**: 384px desktop, 320px mobile
- **Max Height**: 80vh desktop, 70vh mobile
- **Position**: Dynamic (calculated)
- **Background**: Gray-800 (#1f2937)
- **Border**: 1px Gray-600 (#4b5563)
- **Border Radius**: 12px (rounded-xl)

---

## 🎯 Restaurant Navigation Structure

### Primary Navigation Items
```typescript
const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', isActive: true },
  { id: 'kitchen', icon: ChefHat, label: 'Kitchen', hasNotifications: true, notificationCount: 3 },
  { id: 'orders', icon: Utensils, label: 'Orders', hasNotifications: true, notificationCount: 7 },
  { id: 'inventory', icon: Package, label: 'Inventory' },
  { id: 'staff', icon: Users, label: 'Staff' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'payments', icon: CreditCard, label: 'Payments' },
  { id: 'reservations', icon: Calendar, label: 'Bookings' }
];
```

### Restaurant Apps Collection
```typescript
const restaurantApps = [
  { id: 'pos', label: 'POS System', icon: CreditCard, color: 'bg-green-600' },
  { id: 'menu', label: 'Menu Manager', icon: FileText, color: 'bg-blue-600' },
  { id: 'reservations', label: 'Reservations', icon: Calendar, color: 'bg-purple-600' },
  { id: 'chat', label: 'Team Chat', icon: MessageSquare, color: 'bg-indigo-600' },
  { id: 'training', label: 'Training', icon: Video, color: 'bg-red-600' },
  { id: 'scheduling', label: 'Scheduling', icon: Clock, color: 'bg-orange-600' },
  { id: 'finance', label: 'Finance', icon: Calculator, color: 'bg-teal-600' },
  { id: 'inventory', label: 'Inventory', icon: Clipboard, color: 'bg-yellow-600' },
  { id: 'support', label: 'Help & Support', icon: HelpCircle, color: 'bg-gray-600' },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, color: 'bg-pink-600' }
];
```

---

## 🔧 Customization Options

### Theme Variants
```scss
// Light Mode Override (if needed)
.hera-gold-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #1f2937;
  --accent-primary: #30D5C8;
}

// High Contrast Mode
.hera-gold-contrast {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --accent-primary: #00ff88;
}
```

### Animation Configurations
```typescript
// Framer Motion Presets
const goldThemeAnimations = {
  sidebar: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.9, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.9, x: -20 }
  },
  navbar: {
    searchFocus: { scale: 1.02 },
    buttonHover: { scale: 1.05 }
  }
};
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Sidebar: 64px width (16 in Tailwind)
- Modal: 320px width, positioned with margins
- Text: Smaller font sizes (text-[10px])
- Icons: 4x4 (w-4 h-4)

### Desktop (≥ 640px)
- Sidebar: 80px width (20 in Tailwind)
- Modal: 384px width, smart positioning
- Text: Standard font sizes (text-xs)
- Icons: 5x5 (w-5 h-5)

---

## 🛡️ Accessibility Features

### ARIA Labels
```typescript
// Screen reader support
const accessibilityLabels = {
  navbar: "Main navigation",
  sidebar: "Restaurant management sidebar",
  darkModeToggle: darkMode ? "Switch to light mode" : "Switch to dark mode",
  searchBar: "Search for apps, people, and more",
  appsModal: "Restaurant applications menu",
  notifications: "Notifications center"
};
```

### Keyboard Navigation
- **Tab Order**: Navbar → Sidebar → Main Content
- **Escape Key**: Closes modals and dropdowns
- **Arrow Keys**: Navigate within modals
- **Enter/Space**: Activate buttons and links

---

## 🔄 State Management

### Theme Persistence
```typescript
// LocalStorage Integration
useEffect(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode) {
    const isDarkMode = JSON.parse(savedDarkMode);
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }
}, []);
```

### Modal State Management
```typescript
// Apps Modal State
const [showAppsModal, setShowAppsModal] = useState(false);
const [modalPosition, setModalPosition] = useState({ left: 84, top: '50%' });
const [searchQuery, setSearchQuery] = useState('');
```

---

## 🚀 Performance Optimizations

### Lazy Loading
```typescript
// Dynamic component loading
const TeamsStyleSidebar = dynamic(() => import('@/components/ui/TeamsStyleSidebar'), {
  ssr: true,
  loading: () => <div className="w-20 h-full bg-gray-800 animate-pulse" />
});
```

### Memoization
```typescript
// Prevent unnecessary re-renders
const NavigationItems = React.memo(({ items }) => (
  // Navigation rendering logic
));

const AppsModal = React.memo(({ apps, searchQuery }) => (
  // Apps modal rendering logic
));
```

---

## 📋 Testing Checklist

### Visual Testing
- [ ] Dark mode toggle works correctly
- [ ] Sidebar navigation is responsive
- [ ] Apps modal positions properly on all screen sizes
- [ ] Notification badges display correctly
- [ ] Search functionality works as expected
- [ ] Color contrast meets WCAG standards

### Functional Testing
- [ ] Modal stays within screen boundaries
- [ ] Window resize recalculates modal position
- [ ] Theme persistence across page reloads
- [ ] Keyboard navigation is smooth
- [ ] Touch interactions work on mobile
- [ ] Screen readers can access all elements

---

## 🔧 Troubleshooting

### Common Issues
1. **Modal positioning issues**: Check `calculateModalPosition()` function
2. **Dark mode not persisting**: Verify localStorage implementation
3. **Sidebar not responsive**: Check Tailwind classes `ml-20 sm:ml-16`
4. **Search not working**: Verify `restaurantApps` array and filter logic
5. **Icons not displaying**: Check Lucide React imports

### Debug Utilities
```typescript
// Debug modal positioning
const debugModalPosition = () => {
  console.log('Screen:', { width: window.innerWidth, height: window.innerHeight });
  console.log('Modal Position:', modalPosition);
  console.log('Sidebar Width:', window.innerWidth >= 640 ? 80 : 64);
};
```

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Theme customizer for accent colors
- [ ] Advanced search with AI suggestions
- [ ] Keyboard shortcuts overlay
- [ ] Sidebar favorites and recents
- [ ] Modal drag and drop positioning
- [ ] Voice command integration
- [ ] RTL language support

---

## 📚 Related Files

### Core Components
- `/components/ui/navbar.tsx` - Main navigation bar
- `/components/ui/TeamsStyleSidebar.tsx` - Restaurant sidebar
- `/app/restaurant/dashboard/page.tsx` - Implementation example

### Theme Files
- `/styles/globals.css` - Global theme styles
- `/tailwind.config.js` - Tailwind configuration
- `/hooks/useMobileTheme.ts` - Theme utilities

### Documentation
- `/docs/API_REFERENCE.md` - API documentation
- `/docs/INTEGRATION_GUIDE.md` - Integration guide
- `This file` - Complete design system documentation

---

**🏆 HERA Gold Theme - Professional restaurant management interface with Microsoft Teams-inspired design, featuring sophisticated dark theme with teal accents, intelligent responsive behavior, and comprehensive accessibility support.**