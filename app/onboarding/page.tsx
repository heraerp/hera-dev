"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { useTheme } from "@/components/providers/theme-provider"
import { navigate } from "@/lib/utils/client"
import motionConfig from "@/lib/motion"

export default function OnboardingPage() {
  const { setContext } = useTheme()

  React.useEffect(() => {
    setContext("strategic")
  }, [setContext])

  const handleContinueToDashboard = () => {
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.smooth}
      >
        <Card variant="glass" className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...motionConfig.spring.bounce, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-16 h-16 bg-strategic-innovation/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-strategic-innovation" />
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl font-bold text-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome to HERA Universal!
          </motion.h1>

          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your account has been created successfully. Get ready to experience the world's most advanced ERP system.
          </motion.p>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-strategic-innovation" />
                <span>AI-powered insights enabled</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-strategic-growth" />
                <span>Revolutionary design system activated</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-strategic-growth" />
                <span>Enterprise security protocols active</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <Button
              onClick={handleContinueToDashboard}
              variant="gradient"
              size="lg"
              className="w-full bg-gradient-to-r from-strategic-innovation to-strategic-growth"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}