"use client"

import * as React from "react"

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail, ArrowRight, ArrowLeft, Sparkles, Shield, 
  Clock, Check, RefreshCw, Send, KeyRound 
} from "lucide-react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/revolutionary-card"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { useGestures } from "@/hooks/use-gestures"
import { cn } from "@/lib/utils"
import { navigate, getWindowDimensions, safeDocument } from "@/lib/utils/client"
import motionConfig from "@/lib/motion"

type ResetStep = "email" | "sent" | "success"

export default function ForgotPasswordPage() {
  const { setContext, cognitiveState } = useTheme()
  const { getAdaptedColor } = useAdaptiveColor()
  
  // Form state
  const [email, setEmail] = React.useState("")
  const [currentStep, setCurrentStep] = React.useState<ResetStep>("email")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [resendCount, setResendCount] = React.useState(0)
  const [resendCooldown, setResendCooldown] = React.useState(0)
  
  // Animation states
  const [focusedField, setFocusedField] = React.useState<string | null>(null)
  const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number }>>([])
  
  // Refs
  const pageRef = React.useRef<HTMLDivElement>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  
  // Set context for security theme
  React.useEffect(() => {
    setContext("operational") // Security operations use operational colors
  }, [setContext])
  
  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])
  
  // Gesture handlers for enhanced UX
  const gestureHandlers = {
    onSwipeRight: () => {
      // Quick navigation back to login
      navigate("/auth/login")
    },
    onSwipeLeft: () => {
      if (currentStep === "sent") {
        // Quick resend action
        handleResend()
      }
    },
    onDoubleTap: () => {
      // Quick focus on email field (if on email step)
      if (currentStep === "email") {
        const emailInput = safeDocument.getElementById("email")
        emailInput?.focus()
      }
    },
  }
  
  useGestures(pageRef, gestureHandlers, {
    enabledGestures: ["swipeLeft", "swipeRight", "doubleTap"],
  })
  
  // Email validation
  const isValidEmail = React.useMemo(() => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [email])
  
  // Handle password reset request
  const handlePasswordReset = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!isValidEmail) {
      setError("Please enter a valid email address")
      // Shake animation for validation error
      formRef.current?.animate([
        { transform: "translateX(0)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(0)" },
      ], {
        duration: 400,
        easing: "ease-in-out",
      })
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create success particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      setParticles(newParticles)
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 3000)
      
      setCurrentStep("sent")
    } catch (error) {
      console.error("Password reset failed:", error)
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [isValidEmail])
  
  // Handle resend
  const handleResend = React.useCallback(async () => {
    if (resendCooldown > 0) return
    
    setIsLoading(true)
    setResendCount(prev => prev + 1)
    setResendCooldown(60) // 60 second cooldown
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success feedback
      const successParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      setParticles(successParticles)
      setTimeout(() => setParticles([]), 2000)
      
    } catch (error) {
      console.error("Resend failed:", error)
      setError("Failed to resend email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [resendCooldown])
  
  // Handle back to login
  const handleBackToLogin = React.useCallback(() => {
    navigate("/auth/login")
  }, [])
  
  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Security Theme Background */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, hsl(217, 91%, 60%) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, hsl(142, 71%, 45%) 0%, transparent 50%)
            `,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Security Icons */}
        <div className="absolute inset-0">
          {[Shield, KeyRound, Mail].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * getWindowDimensions().width,
                y: Math.random() * getWindowDimensions().height,
                opacity: 0,
              }}
              animate={{
                y: [null, -20, 20, -20],
                opacity: [0, 0.1, 0.1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon className="w-8 h-8 text-operational-primary" />
            </motion.div>
          ))}
        </div>
        
        {/* Success Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-operational-success rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{
                scale: 0,
                opacity: 1,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                y: -100,
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Information */}
        <motion.div
          className="hidden lg:flex lg:w-2/5 items-center justify-center p-12 bg-gradient-to-br from-operational-primary/5 to-operational-success/5"
          variants={motionConfig.variants.slide}
          initial="hiddenLeft"
          animate="visible"
        >
          <div className="max-w-md space-y-8">
            {/* Logo & Security Message */}
            <motion.div
              className="text-center space-y-6"
              variants={motionConfig.variants.scale}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-3 text-3xl font-bold text-operational-primary">
                <motion.div
                  className="w-10 h-10 bg-operational-primary rounded-lg flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
                HERA Universal
              </div>
              
              <motion.h1
                className="text-3xl font-light text-foreground/90"
                variants={motionConfig.variants.fade}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                Secure Account
                <span className="block font-semibold bg-gradient-to-r from-operational-primary to-operational-success bg-clip-text text-transparent">
                  Recovery
                </span>
              </motion.h1>
              
              <motion.p
                className="text-lg text-muted-foreground leading-relaxed"
                variants={motionConfig.variants.fade}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                Don't worry! We'll help you regain access to your HERA Universal account 
                with our secure recovery process.
              </motion.p>
            </motion.div>
            
            {/* Security Features */}
            <motion.div
              className="space-y-4"
              variants={motionConfig.variants.stagger.container}
              initial="hidden"
              animate="visible"
            >
              {[
                { 
                  icon: Shield, 
                  label: "Enterprise Security", 
                  description: "Bank-grade encryption",
                  color: "text-operational-primary"
                },
                { 
                  icon: Clock, 
                  label: "Quick Recovery", 
                  description: "Usually takes 2-5 minutes",
                  color: "text-operational-success"
                },
                { 
                  icon: KeyRound, 
                  label: "Secure Reset", 
                  description: "One-time secure links",
                  color: "text-operational-pending"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                  variants={motionConfig.variants.stagger.item}
                >
                  <motion.div
                    className={cn("mt-0.5", feature.color)}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.5,
                      repeat: Infinity,
                    }}
                  >
                    <feature.icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.label}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Step Progress Indicator */}
            <motion.div
              className="flex items-center justify-center gap-2"
              variants={motionConfig.variants.fade}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.0 }}
            >
              {["email", "sent", "success"].map((step, index) => (
                <motion.div
                  key={step}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentStep === step 
                      ? "bg-operational-primary w-8" 
                      : ["email", "sent", "success"].indexOf(currentStep) > index
                      ? "bg-operational-success"
                      : "bg-muted"
                  )}
                  animate={{
                    scale: currentStep === step ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: currentStep === step ? Infinity : 0,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Right Side - Reset Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            variants={motionConfig.variants.slide}
            initial="hiddenRight"
            animate="visible"
          >
            <Card
              variant="glass"
              size="lg"
              animation="scale"
              interaction="hover"
              className="backdrop-blur-xl border-operational-primary/20"
            >
              <CardHeader className="text-center space-y-4">
                <motion.div
                  variants={motionConfig.variants.scale}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.8 }}
                >
                  <CardTitle className="text-3xl font-light">
                    {currentStep === "email" && "Reset Password"}
                    {currentStep === "sent" && "Check Your Email"}
                    {currentStep === "success" && "Success!"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {currentStep === "email" && "Enter your email to receive reset instructions"}
                    {currentStep === "sent" && "We've sent you a secure reset link"}
                    {currentStep === "success" && "Your password has been reset successfully"}
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent>
                <AnimatePresence mode="wait">
                  {/* Step 1: Email Input */}
                  {currentStep === "email" && (
                    <motion.form
                      key="email-form"
                      ref={formRef}
                      onSubmit={handlePasswordReset}
                      className="space-y-6"
                      variants={motionConfig.variants.fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Email Field */}
                      <motion.div
                        className="form-group"
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1.0 }}
                      >
                        <label 
                          htmlFor="email" 
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <motion.div
                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            animate={{
                              scale: focusedField === "email" ? 1.1 : 1,
                              color: focusedField === "email" ? getAdaptedColor("primary") : getAdaptedColor("muted"),
                            }}
                          >
                            <Mail className="w-5 h-5" />
                          </motion.div>
                          <motion.input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            className={cn(
                              "form-input pl-10 pr-10 w-full",
                              error && !isValidEmail && "border-destructive"
                            )}
                            placeholder="Enter your email address"
                            whileFocus={{ scale: 1.02 }}
                            transition={motionConfig.spring.swift}
                          />
                          {isValidEmail && (
                            <motion.div
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={motionConfig.spring.bounce}
                            >
                              <Check className="w-4 h-4 text-operational-success" />
                            </motion.div>
                          )}
                        </div>
                        <AnimatePresence>
                          {error && (
                            <motion.p
                              className="text-sm text-destructive mt-1"
                              variants={motionConfig.variants.error}
                              initial="initial"
                              animate="shake"
                              exit="initial"
                            >
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      
                      {/* Submit Button */}
                      <motion.div
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1.2 }}
                      >
                        <Button
                          type="submit"
                          variant="gradient"
                          size="lg"
                          interaction="magnetic"
                          isLoading={isLoading}
                          loadingText="Sending reset link..."
                          hapticFeedback={true}
                          className="w-full bg-gradient-to-r from-operational-primary to-operational-success"
                          rightIcon={<Send className="w-4 h-4" />}
                        >
                          Send Reset Link
                        </Button>
                      </motion.div>
                      
                      {/* Back to Login */}
                      <motion.div
                        className="text-center pt-4"
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1.4 }}
                      >
                        <Link
                          href="/auth/login"
                          className="inline-flex items-center gap-2 text-sm text-operational-primary hover:text-operational-primary/80 font-medium transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Sign In
                        </Link>
                      </motion.div>
                    </motion.form>
                  )}
                  
                  {/* Step 2: Email Sent */}
                  {currentStep === "sent" && (
                    <motion.div
                      key="sent-content"
                      className="text-center space-y-6"
                      variants={motionConfig.variants.fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Success Icon */}
                      <motion.div
                        className="flex justify-center"
                        variants={motionConfig.variants.scale}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="w-16 h-16 bg-operational-success/10 rounded-full flex items-center justify-center"
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <Mail className="w-8 h-8 text-operational-success" />
                        </motion.div>
                      </motion.div>
                      
                      {/* Instructions */}
                      <motion.div
                        className="space-y-3"
                        variants={motionConfig.variants.stagger.container}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.h3
                          className="text-lg font-semibold text-foreground"
                          variants={motionConfig.variants.stagger.item}
                        >
                          Reset link sent!
                        </motion.h3>
                        <motion.p
                          className="text-muted-foreground"
                          variants={motionConfig.variants.stagger.item}
                        >
                          We've sent a secure password reset link to:
                        </motion.p>
                        <motion.p
                          className="font-medium text-operational-primary bg-operational-primary/10 rounded-lg p-3"
                          variants={motionConfig.variants.stagger.item}
                        >
                          {email}
                        </motion.p>
                        <motion.p
                          className="text-sm text-muted-foreground"
                          variants={motionConfig.variants.stagger.item}
                        >
                          Check your inbox and click the link to reset your password. 
                          The link will expire in 15 minutes for security.
                        </motion.p>
                      </motion.div>
                      
                      {/* Resend Button */}
                      <motion.div
                        className="space-y-3"
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                      >
                        <Button
                          onClick={handleResend}
                          variant="outline"
                          size="lg"
                          interaction="hover"
                          disabled={resendCooldown > 0 || isLoading}
                          isLoading={isLoading}
                          loadingText="Resending..."
                          className="w-full"
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                          {resendCooldown > 0 
                            ? `Resend in ${resendCooldown}s` 
                            : resendCount > 0 
                            ? "Resend Email" 
                            : "Didn't receive it? Resend"
                          }
                        </Button>
                        
                        {resendCount > 0 && (
                          <motion.p
                            className="text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Email sent {resendCount} time{resendCount > 1 ? "s" : ""}
                          </motion.p>
                        )}
                      </motion.div>
                      
                      {/* Back to Login */}
                      <motion.div
                        className="pt-4"
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1.0 }}
                      >
                        <Button
                          onClick={handleBackToLogin}
                          variant="ghost"
                          size="sm"
                          className="text-operational-primary hover:text-operational-primary/80"
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back to Sign In
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Success */}
                  {currentStep === "success" && (
                    <motion.div
                      key="success-content"
                      className="text-center space-y-6"
                      variants={motionConfig.variants.fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Success Animation */}
                      <motion.div
                        className="flex justify-center"
                        variants={motionConfig.variants.scale}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="w-20 h-20 bg-operational-success/10 rounded-full flex items-center justify-center"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: 3,
                          }}
                        >
                          <Check className="w-10 h-10 text-operational-success" />
                        </motion.div>
                      </motion.div>
                      
                      {/* Success Message */}
                      <motion.div
                        className="space-y-3"
                        variants={motionConfig.variants.stagger.container}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.h3
                          className="text-xl font-semibold text-foreground"
                          variants={motionConfig.variants.stagger.item}
                        >
                          Password Reset Complete!
                        </motion.h3>
                        <motion.p
                          className="text-muted-foreground"
                          variants={motionConfig.variants.stagger.item}
                        >
                          Your password has been successfully reset. 
                          You can now sign in with your new password.
                        </motion.p>
                      </motion.div>
                      
                      {/* Continue to Login */}
                      <motion.div
                        variants={motionConfig.variants.stagger.item}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                      >
                        <Button
                          onClick={handleBackToLogin}
                          variant="gradient"
                          size="lg"
                          interaction="magnetic"
                          hapticFeedback={true}
                          className="w-full bg-gradient-to-r from-operational-primary to-operational-success"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Continue to Sign In
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            
            {/* Gesture Hints */}
            <motion.div
              className="mt-6 text-center text-xs text-muted-foreground"
              variants={motionConfig.variants.fade}
              initial="hidden"
              animate="visible"
              transition={{ delay: 2.0 }}
            >
              <p>
                💡 Swipe right to go back • 
                {currentStep === "sent" && " Swipe left to resend •"}
                {currentStep === "email" && " Double tap to focus email •"}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}