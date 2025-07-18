'use client'

import { motion } from 'framer-motion'
import { X, Star, Users, Building, ArrowRight, Check, Clock, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Solution {
  id: string
  title: string
  description: string
  icon: any
  features: string[]
  pricing: string
  popular: boolean
  color: string
  bgColor: string
  category: string
  size: string
  path: string
}

interface SolutionDetailsModalProps {
  solution: Solution | null
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

const pricingPlans = {
  starter: {
    name: 'Starter',
    price: '$29/month',
    description: 'Perfect for small businesses getting started',
    features: ['Up to 5 users', 'Basic reporting', 'Email support', 'Mobile app access']
  },
  professional: {
    name: 'Professional', 
    price: '$79/month',
    description: 'Advanced features for growing businesses',
    features: ['Up to 25 users', 'Advanced analytics', 'Priority support', 'API access', 'Custom integrations']
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Full-featured solution for large organizations',
    features: ['Unlimited users', 'Advanced security', 'Dedicated support', 'Custom development', 'SLA guarantee']
  }
}

const benefits = [
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Get started in minutes with our guided setup wizard'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with role-based access control'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built-in collaboration tools for seamless teamwork'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock support when you need it most'
  }
]

export default function SolutionDetailsModal({
  solution,
  isOpen,
  onClose,
  onSelect
}: SolutionDetailsModalProps) {
  if (!isOpen || !solution) return null

  const pricing = pricingPlans[solution.pricing as keyof typeof pricingPlans]
  const Icon = solution.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="elevated" className="p-0">
          {/* Header */}
          <div className={`p-6 bg-gradient-to-br ${solution.bgColor} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-30">
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.color}`} />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${solution.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{solution.title}</h2>
                      {solution.popular && (
                        <Badge className="bg-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{solution.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {solution.category.replace('-', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {solution.size.replace('-', ' ')} business
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Core Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {solution.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <Card variant="gradient" className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{pricing.name}</div>
                      <div className="text-sm text-gray-600">{pricing.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{pricing.price}</div>
                      {pricing.price !== 'Custom' && (
                        <div className="text-sm text-gray-500">per organization</div>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pricing.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Separator />

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Why Choose This Solution?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <benefit.icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{benefit.title}</div>
                        <div className="text-sm text-gray-600">{benefit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementation Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Implementation Timeline</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">1</span>
                    </div>
                    <div>
                      <div className="font-medium">Setup (Day 1)</div>
                      <div className="text-gray-600">Initial configuration</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div>
                      <div className="font-medium">Training (Week 1)</div>
                      <div className="text-gray-600">Team onboarding</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">3</span>
                    </div>
                    <div>
                      <div className="font-medium">Go Live (Week 2)</div>
                      <div className="text-gray-600">Full operation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ready to transform your business with {solution.title}?
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    onSelect(solution.path)
                    onClose()
                  }}
                  className="gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}