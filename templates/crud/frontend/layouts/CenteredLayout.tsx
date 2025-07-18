'use client'

/**
 * HERA Universal Frontend Template - Centered Layout
 * Clean, centered layout for forms, authentication, and focused content
 * Follows "Don't Make Me Think" principles with minimal distractions
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, HelpCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'

interface CenteredLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showLogo?: boolean
  showBackButton?: boolean
  backHref?: string
  actions?: React.ReactNode
  footer?: React.ReactNode
  gradient?: boolean
  pattern?: 'none' | 'dots' | 'grid' | 'waves'
  className?: string
}

// Background patterns
const patterns = {
  none: '',
  dots: `
    background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
    background-size: 24px 24px;
  `,
  grid: `
    background-image: 
      linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px);
    background-size: 24px 24px;
  `,
  waves: `
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  `
}

const maxWidthClasses = {
  sm: 'max-w-sm',   // 384px
  md: 'max-w-md',   // 448px
  lg: 'max-w-lg',   // 512px
  xl: 'max-w-xl',   // 576px
  '2xl': 'max-w-2xl' // 672px
}

export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  children,
  title,
  subtitle,
  description,
  maxWidth = 'md',
  showLogo = true,
  showBackButton = false,
  backHref = '/',
  actions,
  footer,
  gradient = true,
  pattern = 'dots',
  className = ''
}) => {
  const handleBack = () => {
    if (backHref) {
      window.location.href = backHref
    } else {
      window.history.back()
    }
  }

  return (
    <div 
      className={`min-h-screen flex flex-col ${gradient 
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' 
        : 'bg-gray-50'
      } ${className}`}
      style={pattern !== 'none' ? { 
        backgroundImage: patterns[pattern].replace(/\s+/g, ' ').trim() 
      } : undefined}
    >
      {/* Header */}
      <header className="flex-shrink-0 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          {/* Back button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          {/* Logo */}
          {showLogo && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-semibold text-gray-900">HERA Universal</span>
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`w-full ${maxWidthClasses[maxWidth]}`}
        >
          <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            {/* Header Content */}
            {(title || subtitle || description) && (
              <div className="text-center mb-8">
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                
                {subtitle && (
                  <p className="text-lg text-gray-600 mb-3">
                    {subtitle}
                  </p>
                )}
                
                {description && (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Main Content */}
            <div>
              {children}
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 p-4 lg:p-6">
        {footer || (
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </button>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              © 2024 HERA Universal. Built with enterprise-grade security.
            </div>
          </div>
        )}
      </footer>
    </div>
  )
}

// Preset variations for common use cases
export const LoginLayout: React.FC<Omit<CenteredLayoutProps, 'title' | 'subtitle'>> = (props) => (
  <CenteredLayout
    title="Welcome Back"
    subtitle="Sign in to your account"
    maxWidth="sm"
    pattern="dots"
    {...props}
  />
)

export const SignupLayout: React.FC<Omit<CenteredLayoutProps, 'title' | 'subtitle'>> = (props) => (
  <CenteredLayout
    title="Create Account"
    subtitle="Join thousands of businesses using HERA"
    maxWidth="md"
    pattern="grid"
    {...props}
  />
)

export const ForgotPasswordLayout: React.FC<Omit<CenteredLayoutProps, 'title' | 'subtitle'>> = (props) => (
  <CenteredLayout
    title="Reset Password"
    subtitle="Enter your email to receive reset instructions"
    description="We'll send you a secure link to create a new password"
    maxWidth="sm"
    showBackButton={true}
    pattern="waves"
    {...props}
  />
)

export const SetupLayout: React.FC<Omit<CenteredLayoutProps, 'title' | 'subtitle'>> = (props) => (
  <CenteredLayout
    title="Setup Your Business"
    subtitle="Let's get your restaurant configured"
    description="This will only take a few minutes to complete"
    maxWidth="lg"
    pattern="dots"
    gradient={true}
    {...props}
  />
)

export const ErrorLayout: React.FC<{
  errorCode?: string
  title?: string
  description?: string
  children?: React.ReactNode
}> = ({ 
  errorCode = '404', 
  title = 'Page Not Found',
  description = 'The page you are looking for might have been removed or is temporarily unavailable.',
  children
}) => (
  <CenteredLayout
    title={errorCode}
    subtitle={title}
    description={description}
    maxWidth="lg"
    showBackButton={true}
    pattern="none"
    gradient={false}
    className="bg-gray-100"
  >
    {children || (
      <div className="text-center space-y-6">
        <div className="text-6xl">😕</div>
        <Button onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    )}
  </CenteredLayout>
)

export default CenteredLayout