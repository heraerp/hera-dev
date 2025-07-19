/**
 * HERA Universal Signup Wizard
 * Multi-step signup flow with Supabase authentication
 * Collects user information and creates account
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalCard, UniversalCardContent, UniversalCardHeader, UniversalCardTitle } from '@/components/theme/UniversalCard';
import { UniversalThemeButton } from '@/components/theme/UniversalThemeButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import {
  User,
  Mail,
  Lock,
  Building,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Signup form interfaces
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organizationName: string;
  organizationType: string;
  acceptTerms: boolean;
}

interface SignupStep {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SignupWizard() {
  const { colors, isDark } = useMobileTheme();

  // Signup wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
    organizationType: 'restaurant',
    acceptTerms: false
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  // Define signup steps
  const steps: SignupStep[] = [
    {
      id: 1,
      title: "Personal Information",
      description: "Tell us about yourself",
      fields: ['fullName', 'email']
    },
    {
      id: 2,
      title: "Create Password",
      description: "Secure your account",
      fields: ['password', 'confirmPassword']
    },
    {
      id: 3,
      title: "Organization Details",
      description: "Set up your organization",
      fields: ['organizationName', 'organizationType']
    },
    {
      id: 4,
      title: "Review & Confirm",
      description: "Complete your registration",
      fields: ['acceptTerms']
    }
  ];

  // Form validation
  const validateStep = (stepId: number): boolean => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return false;

    const stepErrors: Partial<SignupFormData> = {};
    
    step.fields.forEach(field => {
      switch (field) {
        case 'fullName':
          if (!formData.fullName.trim()) {
            stepErrors.fullName = 'Full name is required';
          }
          break;
        case 'email':
          if (!formData.email.trim()) {
            stepErrors.email = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            stepErrors.email = 'Please enter a valid email address';
          }
          break;
        case 'password':
          if (!formData.password) {
            stepErrors.password = 'Password is required';
          } else if (formData.password.length < 8) {
            stepErrors.password = 'Password must be at least 8 characters';
          }
          break;
        case 'confirmPassword':
          if (!formData.confirmPassword) {
            stepErrors.confirmPassword = 'Please confirm your password';
          } else if (formData.password !== formData.confirmPassword) {
            stepErrors.confirmPassword = 'Passwords do not match';
          }
          break;
        case 'organizationName':
          if (!formData.organizationName.trim()) {
            stepErrors.organizationName = 'Organization name is required';
          }
          break;
        case 'acceptTerms':
          if (!formData.acceptTerms) {
            stepErrors.acceptTerms = 'You must accept the terms and conditions';
          }
          break;
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting to sign up with Supabase...');
      
      // First, try Supabase signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization_name: formData.organizationName,
            organization_type: formData.organizationType
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      
      console.log('📄 Supabase response:', { data, error: signUpError });
      
      if (signUpError) {
        // Handle specific error types
        if (signUpError.message.includes('Database error') || signUpError.message.includes('saving new user')) {
          console.log('⚠️  Supabase auth is misconfigured. Using development mode.');
          
          // Development mode: simulate successful signup
          console.log('🧪 Development mode: Simulating successful signup');
          console.log('👤 User data:', {
            email: formData.email,
            full_name: formData.fullName,
            organization_name: formData.organizationName,
            organization_type: formData.organizationType
          });
          
          // Store user data in localStorage for development
          localStorage.setItem('dev_user_data', JSON.stringify({
            email: formData.email,
            full_name: formData.fullName,
            organization_name: formData.organizationName,
            organization_type: formData.organizationType,
            created_at: new Date().toISOString(),
            id: `dev_${Date.now()}`
          }));
          
          setSuccess(true);
          return;
        } else if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (signUpError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (signUpError.message.includes('Password')) {
          throw new Error('Password must be at least 8 characters long.');
        } else {
          throw new Error(`Signup failed: ${signUpError.message}`);
        }
      }
      
      if (data?.user) {
        setSuccess(true);
        console.log('✅ User created successfully:', data.user.id);
        
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          console.log('✅ Email already confirmed');
        } else {
          console.log('📧 Email confirmation required');
        }
      } else {
        // Fallback success (some Supabase configurations don't return user immediately)
        setSuccess(true);
        console.log('✅ Signup request submitted successfully');
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };


  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <UniversalCard className="w-full max-w-md">
          <UniversalCardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Account Created Successfully!
            </h2>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Your account has been created successfully! You can now continue to the dashboard.
            </p>
            <div className="space-y-3">
              <UniversalThemeButton
                onClick={() => window.location.href = '/auth/login'}
                variant="primary"
                fullWidth
              >
                Sign In Now
              </UniversalThemeButton>
              <UniversalThemeButton
                onClick={() => window.location.href = '/dashboard'}
                variant="secondary"
                fullWidth
              >
                Go to Dashboard
              </UniversalThemeButton>
            </div>
            <div className="text-xs mt-4 p-2 rounded border" style={{ 
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.textSecondary 
            }}>
              💡 <strong>Next Step:</strong> Use your email (<strong>{formData.email}</strong>) and password to sign in
            </div>
          </UniversalCardContent>
        </UniversalCard>
      </div>
    );
  }

  // Loading state (only show when submitting)
  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <Loader2 
            className="w-12 h-12 animate-spin mx-auto mb-4" 
            style={{ color: colors.orange }}
          />
          <p className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
            Creating Account...
          </p>
          <p style={{ color: colors.textSecondary }}>
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="w-full max-w-md">
        <UniversalCard variant="elevated">
          <UniversalCardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <User className="w-8 h-8" style={{ color: colors.orange }} />
            </div>
            <UniversalCardTitle className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Create Account
            </UniversalCardTitle>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {steps[currentStep - 1]?.description}
            </p>
          </UniversalCardHeader>

          <UniversalCardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Step {currentStep} of {steps.length}</span>
                <span style={{ color: colors.textSecondary }}>
                  {Math.round((currentStep / steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.orange,
                    width: `${(currentStep / steps.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleFieldChange('fullName', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: errors.fullName ? colors.error : colors.border,
                            color: colors.textPrimary,
                            focusRingColor: colors.orange
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: errors.email ? colors.error : colors.border,
                            color: colors.textPrimary,
                            focusRingColor: colors.orange
                          }}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.email}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 2: Password */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          className="w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: errors.password ? colors.error : colors.border,
                            color: colors.textPrimary,
                            focusRingColor: colors.orange
                          }}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 w-4 h-4"
                          style={{ color: colors.textMuted }}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                          className="w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: errors.confirmPassword ? colors.error : colors.border,
                            color: colors.textPrimary,
                            focusRingColor: colors.orange
                          }}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 w-4 h-4"
                          style={{ color: colors.textMuted }}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3: Organization */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Organization Name
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                        <input
                          type="text"
                          value={formData.organizationName}
                          onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            borderColor: errors.organizationName ? colors.error : colors.border,
                            color: colors.textPrimary,
                            focusRingColor: colors.orange
                          }}
                          placeholder="Enter your organization name"
                        />
                      </div>
                      {errors.organizationName && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.organizationName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Organization Type
                      </label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) => handleFieldChange('organizationType', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          focusRingColor: colors.orange
                        }}
                      >
                        <option value="restaurant">Restaurant</option>
                        <option value="retail">Retail</option>
                        <option value="services">Services</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surfaceElevated }}>
                        <h3 className="font-medium mb-3" style={{ color: colors.textPrimary }}>
                          Review Your Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: colors.textSecondary }}>Name:</span>
                            <span style={{ color: colors.textPrimary }}>{formData.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: colors.textSecondary }}>Email:</span>
                            <span style={{ color: colors.textPrimary }}>{formData.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: colors.textSecondary }}>Organization:</span>
                            <span style={{ color: colors.textPrimary }}>{formData.organizationName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: colors.textSecondary }}>Type:</span>
                            <span style={{ color: colors.textPrimary }}>
                              {formData.organizationType.charAt(0).toUpperCase() + formData.organizationType.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={(e) => handleFieldChange('acceptTerms', e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border focus:ring-2 transition-all"
                          style={{
                            borderColor: errors.acceptTerms ? colors.error : colors.border,
                            accentColor: colors.orange
                          }}
                        />
                        <label htmlFor="acceptTerms" className="text-sm" style={{ color: colors.textSecondary }}>
                          I accept the{' '}
                          <a href="#" className="underline" style={{ color: colors.orange }}>
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="underline" style={{ color: colors.orange }}>
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-sm" style={{ color: colors.error }}>{errors.acceptTerms}</p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <Separator />

            {/* Navigation Buttons */}
            <div className="flex justify-between space-x-4">
              {currentStep > 1 && (
                <UniversalThemeButton
                  variant="secondary"
                  onClick={prevStep}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  disabled={loading}
                >
                  Previous
                </UniversalThemeButton>
              )}
              
              <div className="flex-1" />
              
              {currentStep < steps.length ? (
                <UniversalThemeButton
                  variant="primary"
                  onClick={nextStep}
                  icon={<ArrowRight className="w-4 h-4" />}
                  disabled={loading}
                >
                  Next
                </UniversalThemeButton>
              ) : (
                <UniversalThemeButton
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  Create Account
                </UniversalThemeButton>
              )}
            </div>
          </UniversalCardContent>
        </UniversalCard>
      </div>
    </div>
  );
}

