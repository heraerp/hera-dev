/**
 * HERA Restaurant Brand System
 * Premium design system inspired by Pentagram's approach to hospitality branding
 * Sophisticated, warm, and professional aesthetic for restaurant operations
 */

export interface BrandColors {
  // Primary Brand Colors
  primary: {
    50: string;   // Lightest tint
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;  // Base color
    600: string;
    700: string;
    800: string;
    900: string;  // Darkest shade
  };
  
  // Secondary Colors
  secondary: {
    50: string;
    500: string;
    900: string;
  };
  
  // Accent Colors
  accent: {
    warmOrange: string;
    goldenYellow: string;
    forestGreen: string;
    deepRed: string;
  };
  
  // Functional Colors
  functional: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Neutral Palette
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Specialty Colors for Restaurant Context
  specialty: {
    appetizer: string;
    mainCourse: string;
    dessert: string;
    beverage: string;
    special: string;
  };
}

// HERA Restaurant Brand Colors - Sophisticated hospitality palette
export const RESTAURANT_BRAND_COLORS: BrandColors = {
  // Primary: Warm Slate - Professional yet inviting
  primary: {
    50: '#f8fafc',   // Pure white tint
    100: '#f1f5f9',  // Light gray-blue
    200: '#e2e8f0',  // Soft gray
    300: '#cbd5e1',  // Medium gray
    400: '#94a3b8',  // Warm gray
    500: '#64748b',  // Base - sophisticated slate
    600: '#475569',  // Rich slate
    700: '#334155',  // Deep slate
    800: '#1e293b',  // Dark slate
    900: '#0f172a',  // Charcoal
  },
  
  // Secondary: Warm Copper - Luxury hospitality accent
  secondary: {
    50: '#fef7f0',   // Cream tint
    500: '#ea580c',  // Rich copper
    900: '#9a3412',  // Deep bronze
  },
  
  // Accent Colors - Restaurant category colors
  accent: {
    warmOrange: '#fb923c',   // Appetizers
    goldenYellow: '#fbbf24', // Specials
    forestGreen: '#059669',  // Healthy options
    deepRed: '#dc2626',      // Meat/Bold flavors
  },
  
  // Functional Colors
  functional: {
    success: '#10b981',  // Fresh green
    warning: '#f59e0b',  // Amber
    error: '#ef4444',    // Clear red
    info: '#3b82f6',     // Professional blue
  },
  
  // Neutral Palette - Warm grays
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },
  
  // Restaurant Category Colors
  specialty: {
    appetizer: '#f97316',    // Vibrant orange
    mainCourse: '#dc2626',   // Bold red
    dessert: '#ec4899',      // Sweet pink
    beverage: '#3b82f6',     // Cool blue
    special: '#8b5cf6',      // Premium purple
  },
};

export interface Typography {
  fontFamilies: {
    display: string;     // Headlines, branding
    sans: string;        // UI, body text
    mono: string;        // Code, numbers
  };
  
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    black: number;
  };
  
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// Typography System
export const RESTAURANT_TYPOGRAPHY: Typography = {
  fontFamilies: {
    display: '"Playfair Display", "Times New Roman", serif', // Elegant headlines
    sans: '"Inter", "Segoe UI", system-ui, sans-serif',     // Clean UI
    mono: '"JetBrains Mono", "Fira Code", monospace',       // Technical text
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export interface Spacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

// Spacing Scale
export const RESTAURANT_SPACING: Spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Border Radius Scale
export const RESTAURANT_BORDER_RADIUS: BorderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export interface Shadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// Shadow System - Warm, sophisticated shadows
export const RESTAURANT_SHADOWS: Shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Component Design Tokens
export interface RestaurantComponentTokens {
  card: {
    background: string;
    border: string;
    shadow: string;
    radius: string;
    padding: string;
  };
  
  button: {
    primary: {
      background: string;
      backgroundHover: string;
      text: string;
      border: string;
      shadow: string;
    };
    secondary: {
      background: string;
      backgroundHover: string;
      text: string;
      border: string;
    };
  };
  
  input: {
    background: string;
    border: string;
    borderFocus: string;
    text: string;
    placeholder: string;
  };
  
  navigation: {
    background: string;
    border: string;
    shadow: string;
  };
  
  menuItem: {
    background: string;
    backgroundHover: string;
    border: string;
    shadow: string;
    shadowHover: string;
  };
}

export const RESTAURANT_COMPONENT_TOKENS: RestaurantComponentTokens = {
  card: {
    background: RESTAURANT_BRAND_COLORS.neutral[50],
    border: RESTAURANT_BRAND_COLORS.neutral[200],
    shadow: RESTAURANT_SHADOWS.md,
    radius: RESTAURANT_BORDER_RADIUS.xl,
    padding: RESTAURANT_SPACING[6],
  },
  
  button: {
    primary: {
      background: RESTAURANT_BRAND_COLORS.secondary[500],
      backgroundHover: RESTAURANT_BRAND_COLORS.secondary[900],
      text: RESTAURANT_BRAND_COLORS.neutral[50],
      border: RESTAURANT_BRAND_COLORS.secondary[500],
      shadow: RESTAURANT_SHADOWS.sm,
    },
    secondary: {
      background: RESTAURANT_BRAND_COLORS.neutral[100],
      backgroundHover: RESTAURANT_BRAND_COLORS.neutral[200],
      text: RESTAURANT_BRAND_COLORS.neutral[800],
      border: RESTAURANT_BRAND_COLORS.neutral[300],
    },
  },
  
  input: {
    background: RESTAURANT_BRAND_COLORS.neutral[50],
    border: RESTAURANT_BRAND_COLORS.neutral[300],
    borderFocus: RESTAURANT_BRAND_COLORS.secondary[500],
    text: RESTAURANT_BRAND_COLORS.neutral[900],
    placeholder: RESTAURANT_BRAND_COLORS.neutral[500],
  },
  
  navigation: {
    background: RESTAURANT_BRAND_COLORS.neutral[50],
    border: RESTAURANT_BRAND_COLORS.neutral[200],
    shadow: RESTAURANT_SHADOWS.sm,
  },
  
  menuItem: {
    background: RESTAURANT_BRAND_COLORS.neutral[50],
    backgroundHover: RESTAURANT_BRAND_COLORS.neutral[100],
    border: RESTAURANT_BRAND_COLORS.neutral[200],
    shadow: RESTAURANT_SHADOWS.sm,
    shadowHover: RESTAURANT_SHADOWS.md,
  },
};

// Brand Guidelines
export const RESTAURANT_BRAND_GUIDELINES = {
  logo: {
    primaryUsage: 'Use on light backgrounds with sufficient contrast',
    minimumSize: '24px height',
    clearSpace: '2x logo height on all sides',
  },
  
  typography: {
    display: 'Use Playfair Display for headlines and branding',
    body: 'Use Inter for all UI elements and body text',
    technical: 'Use JetBrains Mono for prices, codes, and technical data',
  },
  
  colorUsage: {
    primary: 'Use slate colors for primary UI elements and navigation',
    secondary: 'Use copper accent sparingly for CTAs and highlights',
    specialty: 'Use category colors to organize menu sections',
    functional: 'Use functional colors only for status indicators',
  },
  
  spacing: {
    sections: RESTAURANT_SPACING[8],  // 32px between major sections
    elements: RESTAURANT_SPACING[4], // 16px between related elements
    components: RESTAURANT_SPACING[6], // 24px between components
  },
  
  accessibility: {
    contrast: 'Maintain minimum 4.5:1 contrast ratio for text',
    focus: 'Use copper accent for focus states',
    motion: 'Respect prefers-reduced-motion',
  },
};

// Utility functions for consistent styling
export const createBrandedClassName = (componentType: keyof RestaurantComponentTokens): string => {
  const tokens = RESTAURANT_COMPONENT_TOKENS[componentType];
  
  switch (componentType) {
    case 'card':
      return `bg-[${tokens.background}] border border-[${tokens.border}] rounded-[${tokens.radius}] p-[${tokens.padding}] shadow-[${tokens.shadow}]`;
    
    case 'button':
      return {
        primary: `bg-[${tokens.primary.background}] hover:bg-[${tokens.primary.backgroundHover}] text-[${tokens.primary.text}] border border-[${tokens.primary.border}] shadow-[${tokens.primary.shadow}] rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:shadow-md`,
        secondary: `bg-[${tokens.secondary.background}] hover:bg-[${tokens.secondary.backgroundHover}] text-[${tokens.secondary.text}] border border-[${tokens.secondary.border}] rounded-lg px-4 py-2 font-medium transition-all duration-200`
      };
    
    default:
      return '';
  }
};

// Generate CSS variables for use in Tailwind config
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};
  
  // Add color variables
  Object.entries(RESTAURANT_BRAND_COLORS).forEach(([colorGroup, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars[`--color-${colorGroup}-${shade}`] = value;
      });
    }
  });
  
  // Add spacing variables
  Object.entries(RESTAURANT_SPACING).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Add typography variables
  cssVars['--font-display'] = RESTAURANT_TYPOGRAPHY.fontFamilies.display;
  cssVars['--font-sans'] = RESTAURANT_TYPOGRAPHY.fontFamilies.sans;
  cssVars['--font-mono'] = RESTAURANT_TYPOGRAPHY.fontFamilies.mono;
  
  return cssVars;
};

// Theme configuration for Tailwind
export const RESTAURANT_TAILWIND_THEME = {
  extend: {
    colors: {
      // Primary brand colors
      brand: {
        primary: RESTAURANT_BRAND_COLORS.primary,
        secondary: RESTAURANT_BRAND_COLORS.secondary,
        accent: RESTAURANT_BRAND_COLORS.accent,
        functional: RESTAURANT_BRAND_COLORS.functional,
        neutral: RESTAURANT_BRAND_COLORS.neutral,
        specialty: RESTAURANT_BRAND_COLORS.specialty,
      },
    },
    fontFamily: {
      display: RESTAURANT_TYPOGRAPHY.fontFamilies.display.split(','),
      sans: RESTAURANT_TYPOGRAPHY.fontFamilies.sans.split(','),
      mono: RESTAURANT_TYPOGRAPHY.fontFamilies.mono.split(','),
    },
    fontSize: RESTAURANT_TYPOGRAPHY.sizes,
    fontWeight: RESTAURANT_TYPOGRAPHY.weights,
    lineHeight: RESTAURANT_TYPOGRAPHY.lineHeights,
    spacing: RESTAURANT_SPACING,
    borderRadius: RESTAURANT_BORDER_RADIUS,
    boxShadow: RESTAURANT_SHADOWS,
  },
};

// Component style generators
export const generateRestaurantCardStyles = (variant: 'default' | 'elevated' | 'interactive' = 'default') => {
  const base = RESTAURANT_COMPONENT_TOKENS.card;
  
  const variants = {
    default: `bg-white border border-gray-200 rounded-xl p-6 shadow-md`,
    elevated: `bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`,
    interactive: `bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer`
  };
  
  return variants[variant];
};

export const generateRestaurantButtonStyles = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  const variants = {
    primary: `bg-orange-600 hover:bg-orange-700 text-white border border-orange-600 shadow-sm rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:shadow-md`,
    secondary: `bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg px-4 py-2 font-medium transition-all duration-200`,
    ghost: `hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-medium transition-all duration-200`
  };
  
  return variants[variant];
};

export const generateMenuItemStyles = (isSelected: boolean = false, category?: string) => {
  const baseStyles = `bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`;
  
  if (isSelected) {
    return `${baseStyles} border-orange-400 bg-orange-50 shadow-md`;
  }
  
  // Category-specific accent colors
  const categoryAccents: Record<string, string> = {
    appetizer: 'hover:border-orange-300',
    main_course: 'hover:border-red-300',
    dessert: 'hover:border-pink-300',
    beverage: 'hover:border-blue-300',
    special: 'hover:border-purple-300',
  };
  
  const categoryAccent = category ? categoryAccents[category] || 'hover:border-gray-300' : 'hover:border-gray-300';
  
  return `${baseStyles} ${categoryAccent}`;
};