"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useProcurementRequest } from '@/hooks/useProcurementRequest';

// AI-Powered Procurement Request Interface
export default function ProcurementRequestPage() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // input, preview, processing, complete
  const [processingSteps, setProcessingSteps] = useState({
    parsing: false,
    extracting: false,
    matching: false,
    validating: false
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    aiResult,
    processNaturalLanguage,
    createRequest,
    isLoading,
    error
  } = useProcurementRequest();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [naturalLanguageInput]);

  const handleProcessInput = async () => {
    if (!naturalLanguageInput.trim() || naturalLanguageInput.length < 10) {
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Reset processing steps
    setProcessingSteps({
      parsing: false,
      extracting: false,
      matching: false,
      validating: false
    });

    try {
      // Simulate progressive processing steps
      setTimeout(() => setProcessingSteps(prev => ({ ...prev, parsing: true })), 500);
      setTimeout(() => setProcessingSteps(prev => ({ ...prev, extracting: true })), 1000);
      setTimeout(() => setProcessingSteps(prev => ({ ...prev, matching: true })), 1500);
      setTimeout(() => setProcessingSteps(prev => ({ ...prev, validating: true })), 2000);
      
      // Process with AI
      await processNaturalLanguage(naturalLanguageInput);
      
      // Short delay before showing results
      setTimeout(() => {
        setCurrentStep('preview');
        setShowPreview(true);
      }, 2500);
      
    } catch (error) {
      console.error('Error processing input:', error);
      setCurrentStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!aiResult) return;

    setCurrentStep('processing');
    
    try {
      await createRequest({
        natural_language_input: naturalLanguageInput,
        urgency: aiResult.urgency,
        estimated_budget: aiResult.estimated_budget
      });
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error creating request:', error);
      setCurrentStep('preview');
    }
  };

  const handleStartOver = () => {
    setNaturalLanguageInput('');
    setShowPreview(false);
    setCurrentStep('input');
    setProcessingSteps({
      parsing: false,
      extracting: false,
      matching: false,
      validating: false
    });
  };

  const examplePrompts = [
    "I need 10 laptops for the engineering team. They should be high-performance with at least 16GB RAM and SSD storage. We need them by next Friday for the new hires.",
    "Order 5 ergonomic office chairs for the marketing department. Budget is around $200 per chair. They should have lumbar support and adjustable height.",
    "We need to purchase software licenses for 20 users of Adobe Creative Suite. This is urgent for the upcoming campaign launch.",
    "Request 3 industrial printers for the production floor. They need to handle heavy-duty printing and be compatible with our current system.",
    "I need office supplies: 100 notebooks, 50 pens, 20 staplers, and 10 boxes of paper clips for the new quarter."
  ];

  const urgencyColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Procurement Request</h1>
                  <p className="text-sm text-gray-600">✨ Describe what you need in plain English</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep !== 'input' && (
                <Button variant="outline" onClick={handleStartOver}>
                  🔄 Start Over
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[
              { id: 'input', label: 'Describe', icon: '💬', active: currentStep === 'input' },
              { id: 'processing', label: 'AI Processing', icon: '🤖', active: currentStep === 'processing' },
              { id: 'preview', label: 'Review', icon: '👀', active: currentStep === 'preview' },
              { id: 'complete', label: 'Complete', icon: '✅', active: currentStep === 'complete' }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300",
                  step.active 
                    ? "bg-blue-500 text-white shadow-lg scale-110" 
                    : currentStep === 'complete' || (index < ['input', 'processing', 'preview', 'complete'].indexOf(currentStep))
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  step.active ? "text-blue-600" : "text-gray-500"
                )}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-4 transition-colors duration-300",
                    currentStep === 'complete' || (index < ['input', 'processing', 'preview', 'complete'].indexOf(currentStep) - 1)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Natural Language Input */}
        <AnimatePresence mode="wait">
          {currentStep === 'input' && (
            <motion.div
              key="input-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={motionConfig.spring.swift}
              className="space-y-6"
            >
              {/* Main Input Card */}
              <Card variant="glass" className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">What do you need to purchase?</h2>
                    <p className="text-gray-600">Describe your procurement needs in natural language. Our AI will understand and structure your request.</p>
                  </div>

                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      placeholder="Example: I need 10 laptops for the engineering team. They should be high-performance with at least 16GB RAM and SSD storage. We need them by next Friday for the new hires."
                      className="min-h-[120px] text-base resize-none border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      maxLength={5000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {naturalLanguageInput.length}/5000
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {naturalLanguageInput.length < 10 ? 
                        "Please provide at least 10 characters" : 
                        "✅ Ready to process"
                      }
                    </div>
                    
                    <Button
                      onClick={handleProcessInput}
                      disabled={naturalLanguageInput.length < 10 || isLoading}
                      className="bg-blue-500 hover:bg-blue-600 px-8"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">🔄</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          🤖 Process with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Example Prompts */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Example Requests</h3>
                <div className="grid grid-cols-1 gap-3">
                  {examplePrompts.map((prompt, index) => (
                    <motion.div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setNaturalLanguageInput(prompt)}
                    >
                      <p className="text-sm text-gray-700">{prompt}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={motionConfig.spring.swift}
              className="flex items-center justify-center py-20"
            >
              <Card variant="glass" className="p-12 text-center max-w-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-6"
                >
                  🤖
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Processing Your Request</h2>
                <p className="text-gray-600 mb-6">Our AI is analyzing your request and extracting structured data...</p>
                
                <div className="space-y-2 text-left">
                  <ProcessingStep step="Parsing natural language" completed={processingSteps.parsing} />
                  <ProcessingStep step="Extracting items and quantities" completed={processingSteps.extracting} />
                  <ProcessingStep step="Finding supplier matches" completed={processingSteps.matching} />
                  <ProcessingStep step="Validating budget requirements" completed={processingSteps.validating} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && aiResult && (
            <motion.div
              key="preview-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={motionConfig.spring.swift}
              className="space-y-6"
            >
              {/* AI Processing Results */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">AI Processing Results</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">AI Confidence:</span>
                    <Badge className={cn(
                      "font-semibold",
                      aiResult.confidence > 0.8 ? "bg-green-100 text-green-800" :
                      aiResult.confidence > 0.6 ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    )}>
                      {Math.round(aiResult.confidence * 100)}%
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Urgency */}
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-sm text-gray-600 mb-1">Urgency Level</div>
                    <Badge className={cn("text-sm", urgencyColors[aiResult.urgency])}>
                      {aiResult.urgency.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Budget */}
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-sm text-gray-600 mb-1">Estimated Budget</div>
                    <div className="text-lg font-bold text-gray-800">
                      {aiResult.estimated_budget ? formatCurrency(aiResult.estimated_budget) : 'TBD'}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {aiResult.category || 'General'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Extracted Items */}
              {aiResult.parsed_items && aiResult.parsed_items.length > 0 && (
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Extracted Items</h3>
                  <div className="space-y-3">
                    {aiResult.parsed_items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{item.item_name}</div>
                          {item.specifications && (
                            <div className="text-sm text-gray-600 mt-1">{item.specifications}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Qty: {item.quantity}</div>
                          {item.unit_price && (
                            <div className="text-sm text-gray-600">{formatCurrency(item.unit_price)} each</div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Supplier Recommendations */}
              {aiResult.suggested_suppliers && aiResult.suggested_suppliers.length > 0 && (
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 Recommended Suppliers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiResult.suggested_suppliers.slice(0, 4).map((supplier, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-800">{supplier.supplier_name}</div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {Math.round(supplier.match_score)}% match
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{supplier.recommendation_reason}</div>
                        {supplier.estimated_price && (
                          <div className="text-sm font-semibold text-green-600">
                            Est. {formatCurrency(supplier.estimated_price)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Budget Validation */}
              {aiResult.budget_validation && (
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Budget Validation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Available Budget</div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(aiResult.budget_validation.budget_available)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Required Budget</div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(aiResult.budget_validation.budget_required)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Status</div>
                      <Badge className={cn(
                        "text-sm",
                        aiResult.budget_validation.budget_status === 'approved' ? "bg-green-100 text-green-800" :
                        aiResult.budget_validation.budget_status === 'requires_approval' ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {aiResult.budget_validation.budget_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('input')}>
                  ← Back to Edit
                </Button>
                
                <Button
                  onClick={handleSubmitRequest}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 px-8"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">🔄</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      ✅ Submit Request
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={motionConfig.spring.swift}
              className="flex items-center justify-center py-20"
            >
              <Card variant="glass" className="p-12 text-center max-w-lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-6"
                >
                  ✅
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted Successfully!</h2>
                <p className="text-gray-600 mb-8">Your procurement request has been processed and submitted for approval. You'll receive notifications about the status updates.</p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/procurement/my-requests'}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    📋 View My Requests
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleStartOver}
                    className="w-full"
                  >
                    🆕 Create Another Request
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 max-w-md"
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">❌</span>
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Processing Step Component
interface ProcessingStepProps {
  step: string;
  completed: boolean;
}

function ProcessingStep({ step, completed }: ProcessingStepProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center",
        completed ? "bg-green-500" : "bg-gray-300"
      )}>
        {completed && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={cn(
        "text-sm",
        completed ? "text-green-600 font-medium" : "text-gray-500"
      )}>
        {step}
      </span>
    </div>
  );
}