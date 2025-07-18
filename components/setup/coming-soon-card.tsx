'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, Bell, Mail, CheckCircle, Sparkles, 
  ArrowRight, Users, Zap, Shield, Globe, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ComingSoonCardProps {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  features: string[]
  category: string
  estimatedLaunch?: string
}

export default function ComingSoonCard({
  id,
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  features,
  category,
  estimatedLaunch = "Q2 2025"
}: ComingSoonCardProps) {
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegisterInterest = async () => {
    if (!email) return
    
    setIsLoading(true)
    
    try {
      // Store interest registration using universal schema
      const response = await fetch('/api/setup/register-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType: 'interest_registration',
          solutionId: id,
          solutionTitle: title,
          email,
          category,
          estimatedLaunch,
          metadata: {
            source: 'setup_page',
            timestamp: new Date().toISOString(),
            features: features,
            userAgent: navigator.userAgent
          }
        }),
      })

      if (response.ok) {
        setIsRegistered(true)
      } else {
        throw new Error('Failed to register interest')
      }
    } catch (error) {
      console.error('Error registering interest:', error)
      // Fallback to localStorage
      const interests = JSON.parse(localStorage.getItem('hera-interests') || '[]')
      interests.push({
        id,
        title,
        email,
        category,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('hera-interests', JSON.stringify(interests))
      setIsRegistered(true)
    } finally {
      setIsLoading(false)
    }
  }

  const keyFeatures = [
    "🚀 AI-Powered Automation",
    "📱 Mobile-First Design", 
    "🔄 Real-Time Sync",
    "🛡️ Enterprise Security",
    "📊 Advanced Analytics",
    "🌐 Multi-Location Support"
  ]

  return (
    <Card className="relative overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Coming Soon
        </Badge>
      </div>

      {/* Header */}
      <div className={`p-6 bg-gradient-to-br ${bgColor} relative`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/15"></div>
        </div>
        
        <div className="relative">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-base leading-relaxed">{description}</p>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Expected Launch: {estimatedLaunch}
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
          What's Coming
        </h4>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
              {feature}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Key Platform Features */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">HERA Universal Features</h5>
          <div className="grid grid-cols-1 gap-2">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Interest Registration */}
        {!isRegistered ? (
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <Bell className="w-4 h-4 mr-2 text-orange-500" />
                Get Notified When Available
              </h5>
              <p className="text-sm text-gray-600 mb-3">
                Be the first to know when {title} solution launches. Get early access and special pricing.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleRegisterInterest}
                disabled={!email || isLoading}
                className={`bg-gradient-to-r ${color} hover:opacity-90 text-white`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    Notify Me
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h5 className="font-medium text-green-900 mb-1">You're on the list!</h5>
            <p className="text-sm text-green-700">
              We'll notify you as soon as {title} solution is ready.
            </p>
          </motion.div>
        )}

        {/* CTA for Restaurant */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-medium text-gray-900 mb-1">Need a solution now?</h6>
              <p className="text-sm text-gray-600">Try our Restaurant solution - fully available today!</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/setup/restaurant'}
              className="ml-4 whitespace-nowrap"
            >
              Try Restaurant
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}