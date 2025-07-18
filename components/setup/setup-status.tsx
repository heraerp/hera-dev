'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, AlertCircle, Building2, MapPin, Users, Settings } from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { type SetupProgress } from '@/lib/services/restaurantSetupService'

interface SetupStatusProps {
  progress: SetupProgress | null
  isSubmitting: boolean
  success: boolean
  error: string | null
}

const setupSteps = [
  { 
    id: 'Creating business entity', 
    title: 'Business Entity', 
    description: 'Setting up your restaurant group',
    icon: Building2,
    color: 'text-orange-600'
  },
  { 
    id: 'Creating restaurant location', 
    title: 'Restaurant Location', 
    description: 'Configuring your restaurant location',
    icon: MapPin,
    color: 'text-blue-600'
  },
  { 
    id: 'Creating manager account', 
    title: 'Manager Account', 
    description: 'Setting up manager access',
    icon: Users,
    color: 'text-green-600'
  },
  { 
    id: 'Setting up restaurant data', 
    title: 'Restaurant Data', 
    description: 'Creating initial restaurant setup',
    icon: Settings,
    color: 'text-purple-600'
  }
]

export default function SetupStatus({ progress, isSubmitting, success, error }: SetupStatusProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  
  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.step)
      if (progress.status === 'completed') {
        setCompletedSteps(prev => new Set([...prev, progress.step]))
      }
    }
  }, [progress])

  const getStepStatus = (stepId: string) => {
    if (completedSteps.has(stepId)) return 'completed'
    if (currentStep === stepId) return 'current'
    return 'pending'
  }

  const calculateProgress = () => {
    if (success) return 100
    if (error) return 0
    return (completedSteps.size / setupSteps.length) * 100
  }

  if (!isSubmitting && !progress && !success && !error) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <Card variant="elevated" className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Setting Up Your Restaurant</h3>
                <p className="text-sm text-gray-600">
                  This will take just a few moments...
                </p>
              </div>
              <div className="flex items-center gap-2">
                {success ? (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                ) : error ? (
                  <Badge className="bg-red-100 text-red-800">Failed</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {setupSteps.map((step, index) => {
                const status = getStepStatus(step.id)
                const StepIcon = step.icon
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      status === 'current' ? 'bg-blue-50 border border-blue-200' :
                      status === 'completed' ? 'bg-green-50 border border-green-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      status === 'current' ? 'bg-blue-100' :
                      status === 'completed' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {status === 'current' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                      {status === 'completed' && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      {status === 'pending' && (
                        <StepIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          status === 'current' ? 'text-blue-900' :
                          status === 'completed' ? 'text-green-900' :
                          'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                        {status === 'current' && (
                          <Badge variant="secondary" className="text-xs">
                            Processing
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Current Progress Message */}
            {progress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <p className="text-sm font-medium text-blue-900">
                  {progress.message}
                </p>
                {progress.error && (
                  <p className="text-sm text-red-600 mt-1">
                    Error: {progress.error}
                  </p>
                )}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Setup Complete! 🎉</h4>
                    <p className="text-sm text-green-700">
                      Your restaurant has been successfully set up. Redirecting to your dashboard...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900">Setup Failed</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}