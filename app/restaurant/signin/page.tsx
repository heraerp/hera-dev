"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChefHat, Mail, Lock, Eye, EyeOff, LogIn, 
  ArrowRight, Sparkles, Shield, Zap, User, AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface LoginData {
  email: string
  password: string
}

export default function RestaurantSignin() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Steve Krug Principle: Immediate feedback on form validity
  const isFormValid = loginData.email && loginData.password

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }))
    setError(null) // Clear errors immediately when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (authError) {
        // Steve Krug Principle: Clear, helpful error messages
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email or password is incorrect. Please check and try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.')
        } else {
          throw new Error(authError.message)
        }
      }

      if (!authData.user) {
        throw new Error('Sign in failed. Please try again.')
      }

      // Check if user has restaurant profile
      const { data: profile, error: profileError } = await supabase
        .rpc('get_user_restaurant_profile', { p_auth_user_id: authData.user.id })

      if (profileError) {
        console.warn('Profile check error:', profileError)
      }

      // Steve Krug Principle: Immediate feedback on success
      router.push('/restaurant/dashboard')

    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message || 'Sign in failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Demo account helper
  const fillDemoAccount = () => {
    setLoginData({
      email: 'demo@zenteagarden.com',
      password: 'demo123456'
    })
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to your restaurant account
            </p>
            
            {/* Benefits badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Secure login
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Zap className="w-3 h-3 mr-1" />
                Instant access
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-powered
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? 
                      <EyeOff className="w-4 h-4" /> : 
                      <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-2 p-4 bg-red-100 border border-red-300 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">Sign in failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Demo Account Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Try Demo Account</p>
                    <p className="text-xs text-blue-600">demo@zenteagarden.com</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillDemoAccount}
                    className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800"
                  >
                    Fill Demo
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <a 
                  href="/restaurant/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="text-muted-foreground text-sm">
            Don't have an account?{' '}
            <Link href="/restaurant/signup" className="text-primary hover:underline font-medium">
              Create your restaurant account
            </Link>
          </div>
          
          <div className="text-muted-foreground text-sm">
            <Link href="/restaurant" className="hover:underline">
              ← Back to Restaurant Home
            </Link>
          </div>
        </div>

        {/* Quick Access Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card variant="outline" className="p-4 bg-white/50">
            <h3 className="font-medium text-center mb-3">After signing in, you'll have access to:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span>ChefHat dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Staff management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI inventory</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Real-time orders</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}