import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Golden Ratio Foundation
    extend: {
      colors: {
        // Core System Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Semantic Colors
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        
        // Chart Colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        
        // Contextual Colors
        financial: {
          success: "hsl(var(--financial-success))",
          warning: "hsl(var(--financial-warning))",
          danger: "hsl(var(--financial-danger))",
          neutral: "hsl(var(--financial-neutral))",
          accent: "hsl(var(--financial-accent))",
        },
        
        // The Economist Brand Colors
        economist: {
          red: "#E3120B",
          "red-dark": "#CC0F09",
          "red-light": "#FF1A10",
        },
        operational: {
          primary: "hsl(var(--operational-primary))",
          success: "hsl(var(--operational-success))",
          pending: "hsl(var(--operational-pending))",
          inactive: "hsl(var(--operational-inactive))",
          critical: "hsl(var(--operational-critical))",
        },
        strategic: {
          innovation: "hsl(var(--strategic-innovation))",
          growth: "hsl(var(--strategic-growth))",
          opportunity: "hsl(var(--strategic-opportunity))",
          insight: "hsl(var(--strategic-insight))",
          vision: "hsl(var(--strategic-vision))",
        },
      },
      
      // Revolutionary Spacing System (Golden Ratio Based)
      spacing: {
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'base': 'var(--space-base)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        'responsive-xs': 'var(--space-responsive-xs)',
        'responsive-sm': 'var(--space-responsive-sm)',
        'responsive-md': 'var(--space-responsive-md)',
        'responsive-lg': 'var(--space-responsive-lg)',
        'responsive-xl': 'var(--space-responsive-xl)',
        'golden': 'calc(1rem * 1.618)',
        'golden-sm': 'calc(0.5rem * 1.618)',
        'golden-lg': 'calc(2rem * 1.618)',
      },
      
      // Perfect Typography Scale
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: 'var(--line-height-tight)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--line-height-normal)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--line-height-normal)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--line-height-normal)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--line-height-tight)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--line-height-tight)' }],
      },
      
      // Contextual Line Heights
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
      },
      
      // Advanced Border Radius System
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'base': 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
        'input': 'var(--radius-input)',
      },
      
      // Physics-Based Animation System
      transitionTimingFunction: {
        'spring-bounce': 'var(--spring-bounce)',
        'spring-smooth': 'var(--spring-smooth)',
        'spring-swift': 'var(--spring-swift)',
        'spring-gentle': 'var(--spring-gentle)',
      },
      
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'deliberate': 'var(--duration-deliberate)',
      },
      
      // Revolutionary Box Shadow System
      boxShadow: {
        'subtle': 'var(--shadow-subtle)',
        'gentle': 'var(--shadow-gentle)',
        'moderate': 'var(--shadow-moderate)',
        'prominent': 'var(--shadow-prominent)',
        'dramatic': 'var(--shadow-dramatic)',
        'glow-subtle': 'var(--glow-subtle)',
        'glow-moderate': 'var(--glow-moderate)',
        'glow-prominent': 'var(--glow-prominent)',
      },
      
      // Glass Morphism System
      backdropFilter: {
        'glass-subtle': 'var(--glass-subtle)',
        'glass-moderate': 'var(--glass-moderate)',
        'glass-prominent': 'var(--glass-prominent)',
      },
      
      // Perfect Aspect Ratios
      aspectRatio: {
        'golden': 'var(--golden-ratio)',
        'golden-inverse': 'var(--golden-ratio-inverse)',
        'card': '16 / 10',
        'dashboard': '21 / 9',
        'chart': '4 / 3',
      },
      
      // Advanced Grid System
      gridTemplateColumns: {
        'dashboard': 'repeat(auto-fit, minmax(320px, 1fr))',
        'cards': 'repeat(auto-fill, minmax(280px, 1fr))',
        'data-table': 'auto 1fr auto auto',
        'sidebar': '280px 1fr',
        'main': '1fr 280px',
      },
      
      // Container Queries Support
      container: {
        center: true,
        padding: {
          DEFAULT: 'var(--space-responsive-md)',
          sm: 'var(--space-responsive-lg)',
          lg: 'var(--space-responsive-xl)',
        },
        screens: {
          'xs': '420px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1400px',
        },
      },
      
      // Advanced Font Family System
      fontFamily: {
        'interface': ['SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        'data': ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
        'reading': ['Charter', 'Georgia', 'serif'],
        'brand': ['Inter Variable', 'Inter', 'sans-serif'],
      },
      
      // Revolutionary Animation Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { 
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: 'var(--shadow-subtle)' },
          '50%': { boxShadow: 'var(--shadow-prominent)' },
        },
      },
      
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--spring-smooth)',
        'slide-in': 'slideIn var(--duration-normal) var(--spring-smooth)',
        'scale-in': 'scaleIn var(--duration-normal) var(--spring-bounce)',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulse 2s var(--spring-gentle) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      
      // Advanced Z-Index System
      zIndex: {
        'dropdown': '1000',
        'sticky': '1010',
        'fixed': '1020',
        'modal-backdrop': '1030',
        'modal': '1040',
        'popover': '1050',
        'tooltip': '1060',
        'notification': '1070',
        'max': '9999',
      },
      
      // Revolutionary Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'base': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
    // Custom Plugin for ERP-Specific Utilities
    function({ addUtilities, addComponents, theme }) {
      // Revolutionary Utility Classes
      addUtilities({
        // Perfect Centering
        '.center-absolute': {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        '.center-flex': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        
        // Optical Alignment
        '.optical-center': {
          transform: 'translateY(-0.05em)',
        },
        
        // Reading Optimization
        '.reading-width': {
          maxWidth: 'var(--reading-measure)',
        },
        
        // Glass Morphism
        '.glass-subtle': {
          backdropFilter: 'var(--glass-subtle)',
          backgroundColor: 'var(--glass-background)',
          border: '1px solid var(--glass-border-color)',
        },
        '.glass-moderate': {
          backdropFilter: 'var(--glass-moderate)',
          backgroundColor: 'var(--glass-background)',
          border: '1px solid var(--glass-border-color)',
        },
        '.glass-prominent': {
          backdropFilter: 'var(--glass-prominent)',
          backgroundColor: 'var(--glass-background)',
          border: '1px solid var(--glass-border-color)',
        },
        
        // GPU Acceleration
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        
        // Content Visibility
        '.content-visibility-auto': {
          contentVisibility: 'auto',
          containIntrinsicSize: '0 500px',
        },
        
        // Hover Enhancements
        '.hover-lift': {
          transition: 
            'transform var(--duration-fast) var(--spring-smooth), ' +
            'box-shadow var(--duration-fast) var(--spring-smooth)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: 'var(--shadow-prominent)',
          },
        },
        
        // Focus Ring
        '.focus-ring': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          transition: 'outline-color var(--duration-fast) var(--spring-smooth)',
          '&:focus-visible': {
            outlineColor: 'hsl(var(--ring))',
          },
        },
      });
      
      // Revolutionary Component Classes
      addComponents({
        // Dashboard Card Foundation
        '.dashboard-card': {
          containerType: 'inline-size',
          aspectRatio: 'var(--golden-ratio)',
          padding: 'var(--space-responsive-md)',
          borderRadius: 'var(--radius-card)',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          boxShadow: 'var(--shadow-subtle), var(--glow-subtle)',
          transition: 
            'transform var(--duration-fast) var(--spring-smooth), ' +
            'box-shadow var(--duration-fast) var(--spring-smooth), ' +
            'background-color var(--duration-fast) var(--spring-smooth)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: 'var(--shadow-prominent)',
          },
        },
        
        // Data Table Excellence
        '.data-table': {
          borderCollapse: 'separate',
          borderSpacing: '0',
          width: '100%',
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
          
          'th, td': {
            padding: 'var(--space-sm) var(--space-base)',
            textAlign: 'left',
            borderBottom: '1px solid hsl(var(--border))',
            transition: 'background-color var(--duration-fast) var(--spring-smooth)',
          },
          
          'tr:hover td': {
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          },
        },
        
        // Form Enhancements
        '.form-group': {
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xs)',
        },
        
        '.form-input': {
          padding: 'var(--space-sm) var(--space-base)',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-input)',
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          fontSize: 'var(--text-base)',
          transition: 
            'border-color var(--duration-fast) var(--spring-smooth), ' +
            'box-shadow var(--duration-fast) var(--spring-smooth)',
          
          '&:focus': {
            outline: 'none',
            borderColor: 'hsl(var(--ring))',
            boxShadow: '0 0 0 3px hsl(var(--ring) / 0.1)',
          },
        },
        
        // Button System
        '.btn': {
          position: 'relative',
          overflow: 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-xs)',
          padding: 'var(--space-sm) var(--space-base)',
          borderRadius: 'var(--radius-button)',
          fontSize: 'var(--text-base)',
          fontWeight: '500',
          transition: 'all var(--duration-fast) var(--spring-smooth)',
          cursor: 'pointer',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '0',
            height: '0',
            background: 'radial-gradient(circle, var(--color-action-primary) 0%, transparent 70%)',
            transition: 'all 300ms var(--spring-smooth)',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            opacity: '0',
          },
          
          '&:hover::before': {
            width: '200%',
            height: '200%',
            opacity: '0.1',
          },
        },
        
        // Navigation System
        '.nav-item': {
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm) var(--space-base)',
          borderRadius: 'var(--radius-base)',
          color: 'hsl(var(--muted-foreground))',
          textDecoration: 'none',
          transition: 'all var(--duration-fast) var(--spring-smooth)',
          
          '&:hover': {
            backgroundColor: 'hsl(var(--muted) / 0.5)',
            color: 'hsl(var(--foreground))',
          },
          
          '&.active': {
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
          },
        },
      });
    },
  ],
} satisfies Config;

export default config;