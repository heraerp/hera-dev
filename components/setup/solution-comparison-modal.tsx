'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Solution {
  id: string
  title: string
  description: string
  features: string[]
  pricing: string
  popular: boolean
  color: string
}

interface SolutionComparisonModalProps {
  solutions: Solution[]
  isOpen: boolean
  onClose: () => void
  onSelect: (solutionId: string) => void
}

const featureCategories = [
  {
    name: 'Core Features',
    features: [
      'Menu Management',
      'Inventory Control',
      'Customer Management',
      'Order Processing',
      'Payment Processing',
      'Reporting & Analytics'
    ]
  },
  {
    name: 'Advanced Features',
    features: [
      'Multi-location Support',
      'API Integration',
      'Custom Workflows',
      'Mobile App',
      'AI Recommendations',
      'Real-time Notifications'
    ]
  },
  {
    name: 'Enterprise Features',
    features: [
      'Advanced Analytics',
      'Compliance Tools',
      'Custom Branding',
      'Priority Support',
      'SLA Guarantee',
      'Dedicated Account Manager'
    ]
  }
]

export default function SolutionComparisonModal({
  solutions,
  isOpen,
  onClose,
  onSelect
}: SolutionComparisonModalProps) {
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([])

  if (!isOpen) return null

  const toggleSolution = (solutionId: string) => {
    setSelectedSolutions(prev => 
      prev.includes(solutionId) 
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId].slice(-3) // Max 3 solutions
    )
  }

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
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="elevated" className="p-0">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Compare Solutions</h2>
                <p className="text-gray-600 mt-1">
                  Select up to 3 solutions to compare features and pricing
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Solution Selection */}
          <div className="p-6 border-b bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {solutions.map((solution) => (
                <button
                  key={solution.id}
                  onClick={() => toggleSolution(solution.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSolutions.includes(solution.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{solution.title}</div>
                  {solution.popular && (
                    <Badge className="mt-2 text-xs bg-orange-500">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-auto max-h-[60vh]">
            {selectedSolutions.length > 0 ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Features</th>
                        {selectedSolutions.map((solutionId) => {
                          const solution = solutions.find(s => s.id === solutionId)
                          return (
                            <th key={solutionId} className="text-center p-4 min-w-[200px]">
                              <div className="space-y-2">
                                <div className="font-semibold">{solution?.title}</div>
                                <Badge variant="outline" className="text-xs">
                                  {solution?.pricing}
                                </Badge>
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {featureCategories.map((category, categoryIndex) => (
                        <>
                          <tr key={`category-${categoryIndex}`} className="bg-muted/20">
                            <td colSpan={selectedSolutions.length + 1} className="p-4 font-semibold">
                              {category.name}
                            </td>
                          </tr>
                          {category.features.map((feature, featureIndex) => (
                            <tr key={`${categoryIndex}-${featureIndex}`} className="border-b">
                              <td className="p-4 text-sm">{feature}</td>
                              {selectedSolutions.map((solutionId) => {
                                const solution = solutions.find(s => s.id === solutionId)
                                const hasFeature = solution?.features.includes(feature) || 
                                                 Math.random() > 0.3 // Mock feature availability
                                return (
                                  <td key={solutionId} className="p-4 text-center">
                                    {hasFeature ? (
                                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                                    ) : (
                                      <div className="w-4 h-4 mx-auto" />
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-lg mb-2">Select Solutions to Compare</div>
                <div className="text-sm">
                  Choose solutions above to see a detailed feature comparison
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedSolutions.length > 0 && (
            <div className="p-6 border-t bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedSolutions.length} of 3 solutions selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      const firstSelected = selectedSolutions[0]
                      onSelect(firstSelected)
                      onClose()
                    }}
                  >
                    Choose {solutions.find(s => s.id === selectedSolutions[0])?.title}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}