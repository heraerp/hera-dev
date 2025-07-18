/**
 * HERA Universal Frontend Template System - Main Export
 * Complete frontend template system following "Don't Make Me Think" principles
 */

import React from 'react'

// Layout Components
export { DashboardLayout } from './layouts/DashboardLayout'
export { 
  CenteredLayout,
  LoginLayout,
  SignupLayout,
  ForgotPasswordLayout,
  SetupLayout,
  ErrorLayout
} from './layouts/CenteredLayout'

// Page Templates
export { 
  SimpleListPage,
  ProductListPage,
  CustomerListPage,
  OrderListPage
} from './pages/SimpleListPage'
export { FormPage } from './pages/FormPage'

// Responsive System
export { 
  breakpoints,
  breakpointsNumeric,
  containerMaxWidths,
  mediaQueries,
  useBreakpoint,
  isAboveBreakpoint,
  isBelowBreakpoint,
  mq,
  responsiveSpacing,
  responsiveFontSizes,
  gridSystem,
  responsivePatterns
} from './responsive/breakpoints'

export {
  Grid,
  GridItem,
  Container,
  Flex,
  Stack,
  Sidebar,
  TwoColumn,
  ThreeColumn
} from './responsive/GridSystem'

// Design System
export {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  animation,
  components,
  accessibility,
  defaultTheme,
  darkTheme,
  createCustomTheme,
  getColorValue,
  getSpacingValue,
  type Theme
} from './design-system/tokens'

// Quick Start Templates
export const templates = {
  // Page templates for common use cases
  pages: {
    SimpleListPage,
    ProductListPage,
    CustomerListPage,
    OrderListPage,
    FormPage
  },
  
  // Layout templates
  layouts: {
    DashboardLayout,
    CenteredLayout,
    LoginLayout,
    SignupLayout,
    SetupLayout,
    ErrorLayout
  },
  
  // Responsive components
  responsive: {
    Grid,
    GridItem,
    Container,
    Flex,
    Stack,
    Sidebar,
    TwoColumn,
    ThreeColumn
  }
}

// Common Layout Patterns
export const patterns = {
  // Product management pattern
  productManagement: {
    layout: DashboardLayout,
    page: ProductListPage,
    quickActions: [
      { label: 'Add Product', primary: true },
      { label: 'Import Products' },
      { label: 'Export Catalog' }
    ]
  },
  
  // Customer management pattern
  customerManagement: {
    layout: DashboardLayout,
    page: CustomerListPage,
    quickActions: [
      { label: 'Add Customer', primary: true },
      { label: 'Import Contacts' },
      { label: 'Send Newsletter' }
    ]
  },
  
  // Order processing pattern
  orderProcessing: {
    layout: DashboardLayout,
    page: OrderListPage,
    realTime: true,
    quickActions: [
      { label: 'New Order', primary: true },
      { label: 'Print Queue' },
      { label: 'Daily Report' }
    ]
  },
  
  // Authentication pattern
  authentication: {
    login: LoginLayout,
    signup: SignupLayout,
    forgotPassword: ForgotPasswordLayout,
    setup: SetupLayout
  },
  
  // Form patterns
  forms: {
    create: FormPage,
    edit: FormPage,
    multiStep: FormPage,
    centered: CenteredLayout
  }
}

// Design System Presets
export const presets = {
  // Color schemes
  colorSchemes: {
    default: {
      primary: colors.primary[500],
      secondary: colors.secondary[500],
      accent: colors.primary[600]
    },
    
    warm: {
      primary: '#f59e0b', // Warm yellow
      secondary: '#f97316', // Orange
      accent: '#dc2626' // Red
    },
    
    cool: {
      primary: '#06b6d4', // Cyan
      secondary: '#8b5cf6', // Purple
      accent: '#3b82f6' // Blue
    },
    
    nature: {
      primary: '#10b981', // Green
      secondary: '#059669', // Dark green
      accent: '#34d399' // Light green
    }
  },
  
  // Typography presets
  typography: {
    modern: {
      heading: 'Cal Sans',
      body: 'Inter',
      mono: 'JetBrains Mono'
    },
    
    classic: {
      heading: 'Georgia',
      body: 'system-ui',
      mono: 'Monaco'
    },
    
    minimal: {
      heading: 'Helvetica Neue',
      body: 'Helvetica Neue',
      mono: 'SF Mono'
    }
  },
  
  // Spacing presets
  spacing: {
    compact: {
      section: spacing[8],
      component: spacing[4],
      element: spacing[2]
    },
    
    comfortable: {
      section: spacing[12],
      component: spacing[6],
      element: spacing[3]
    },
    
    spacious: {
      section: spacing[16],
      component: spacing[8],
      element: spacing[4]
    }
  }
}

// Utility Functions
export const utils = {
  // Create a complete page with layout
  createPage: (pageProps: any, layoutProps: any = {}) => {
    return {
      page: pageProps,
      layout: layoutProps,
      render: (PageComponent: React.ComponentType, LayoutComponent: React.ComponentType) => (
        <LayoutComponent {...layoutProps}>
          <PageComponent {...pageProps} />
        </LayoutComponent>
      )
    }
  },
  
  // Responsive helper
  responsive: {
    useBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
    mq
  },
  
  // Theme utilities
  theme: {
    createCustomTheme,
    getColorValue,
    getSpacingValue
  }
}

/**
 * HERA Universal Frontend Template System
 * 
 * Features:
 * ✅ Don't Make Me Think Design Principles
 *   - Self-evident interfaces and navigation
 *   - Minimal cognitive load
 *   - Clear visual hierarchy
 *   - Consistent interaction patterns
 * 
 * ✅ Modern Web Design Standards
 *   - Mobile-first responsive design
 *   - Progressive enhancement
 *   - Performance optimization
 *   - Accessibility compliance (WCAG 2.1 AA)
 * 
 * ✅ Layout System
 *   - Dashboard layout with sidebar navigation
 *   - Centered layout for forms and auth
 *   - Responsive grid system
 *   - Flexible component arrangements
 * 
 * ✅ Page Templates
 *   - Simple list pages for data management
 *   - Form pages with multi-step support
 *   - Preset configurations for common use cases
 * 
 * ✅ Design System
 *   - Comprehensive design tokens
 *   - Color system with semantic meanings
 *   - Typography scale and spacing
 *   - Animation and interaction guidelines
 * 
 * ✅ Responsive Design
 *   - Mobile-first breakpoint system
 *   - Touch-friendly interfaces
 *   - Adaptive layouts and components
 * 
 * ✅ Developer Experience
 *   - TypeScript support
 *   - Component composition
 *   - Preset patterns and configurations
 *   - Easy customization and theming
 * 
 * Usage Examples:
 * 
 * // Simple product management page
 * import { ProductListPage } from '@/templates/crud/frontend'
 * 
 * export default function Products() {
 *   return (
 *     <ProductListPage
 *       service={productService}
 *       fields={productFields}
 *       title="Product Catalog"
 *     />
 *   )
 * }
 * 
 * // Custom form with centered layout
 * import { FormPage, CenteredLayout } from '@/templates/crud/frontend'
 * 
 * export default function CreateProduct() {
 *   return (
 *     <FormPage
 *       layout="centered"
 *       title="Add New Product"
 *       fields={productFields}
 *       onSubmit={handleSubmit}
 *     />
 *   )
 * }
 * 
 * // Responsive grid layout
 * import { Grid, GridItem, Container } from '@/templates/crud/frontend'
 * 
 * export default function Dashboard() {
 *   return (
 *     <Container>
 *       <Grid cols={1} mdCols={2} lgCols={3} gap="lg">
 *         <GridItem>
 *           <MetricCard title="Sales" value="$12,345" />
 *         </GridItem>
 *         <GridItem md={2}>
 *           <RecentOrders />
 *         </GridItem>
 *       </Grid>
 *     </Container>
 *   )
 * }
 */

export default {
  templates,
  patterns,
  presets,
  utils,
  // Re-export everything for convenience
  DashboardLayout,
  CenteredLayout,
  SimpleListPage,
  FormPage,
  Grid,
  GridItem,
  Container,
  colors,
  typography,
  spacing
}