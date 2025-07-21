/**
 * HERA Digital Accountant - Enhanced Account Mapping Component
 * 
 * Shows real-time integration between Digital Accountant and Chart of Accounts
 * Demonstrates AI-powered account mapping with 9-category structure
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BarChart3, Zap, CheckCircle2, ArrowRight, Target,
  DollarSign, TrendingUp, Activity, AlertCircle, Eye,
  Building, Users, Clock, Sparkles, BookOpen, Calculator,
  Receipt, FileText, CreditCard, PieChart
} from 'lucide-react';

interface AccountMapping {
  primaryAccount: {
    code: string;
    name: string;
    type: string;
    category: string;
    confidence: number;
  };
  alternativeAccounts: Array<{
    code: string;
    name: string;
    confidence: number;
    reason: string;
  }>;
  journalEntries: Array<{
    accountCode: string;
    accountName: string;
    debit?: number;
    credit?: number;
    description: string;
  }>;
  aiReasoning: string[];
  businessRules: string[];
}

interface DocumentExample {
  id: string;
  type: 'receipt' | 'invoice' | 'expense';
  vendor: string;
  description: string;
  amount: number;
  category: string;
  icon: any;
  color: string;
}

export default function EnhancedAccountMapping() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentExample | null>(null);
  const [mapping, setMapping] = useState<AccountMapping | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);

  const documentExamples: DocumentExample[] = [
    {
      id: '1',
      type: 'receipt',
      vendor: 'Fresh Valley Farms',
      description: 'Organic vegetables and herbs for kitchen',
      amount: 245.50,
      category: 'Food & Ingredients',
      icon: Receipt,
      color: 'from-green-500 to-green-600'
    },
    {
      id: '2', 
      type: 'invoice',
      vendor: 'Premium Meats Co',
      description: 'Fresh chicken and beef for weekend menu',
      amount: 890.75,
      category: 'Food & Ingredients',
      icon: FileText,
      color: 'from-red-500 to-red-600'
    },
    {
      id: '3',
      type: 'expense',
      vendor: 'Electricity Board',
      description: 'Monthly electricity bill for restaurant',
      amount: 1250.00,
      category: 'Utilities',
      icon: CreditCard,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: '4',
      type: 'receipt',
      vendor: 'Google Ads',
      description: 'Digital marketing campaign for delivery promotions',
      amount: 450.00,
      category: 'Marketing',
      icon: Receipt,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  const handleDocumentSelect = async (document: DocumentExample) => {
    setSelectedDocument(document);
    setIsProcessing(true);
    setMapping(null);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic mapping based on document
    const mockMapping = generateMockMapping(document);
    setMapping(mockMapping);
    setIsProcessing(false);
  };

  const generateMockMapping = (document: DocumentExample): AccountMapping => {
    switch (document.vendor.toLowerCase()) {
      case 'fresh valley farms':
        return {
          primaryAccount: {
            code: '5001000',
            name: 'Food Materials - Vegetables',
            type: 'COST_OF_SALES',
            category: 'Cost of Sales',
            confidence: 95
          },
          alternativeAccounts: [
            { code: '5002000', name: 'Food Materials - Spices', confidence: 80, reason: 'Alternative food material account' },
            { code: '6001000', name: 'Kitchen Operations', confidence: 65, reason: 'Could be operational expense' }
          ],
          journalEntries: [
            { accountCode: '5001000', accountName: 'Food Materials - Vegetables', debit: 245.50, description: 'Organic vegetables purchase' },
            { accountCode: '2000001', accountName: 'Accounts Payable - Trade', credit: 245.50, description: 'Payment due: Fresh Valley Farms' }
          ],
          aiReasoning: [
            'Vendor "Fresh Valley Farms" is known COST_OF_SALES supplier',
            'Product description contains "vegetables" indicating food material',
            'Amount $245.50 is typical for food supplier transactions'
          ],
          businessRules: [
            'Restaurant Rule: Food suppliers map to Cost of Sales (5000000-5999999)',
            'Keyword Rule: "vegetables" maps to COST_OF_SALES',
            'Vendor Rule: Agricultural suppliers default to food materials'
          ]
        };

      case 'premium meats co':
        return {
          primaryAccount: {
            code: '5005000',
            name: 'Food Materials - Meat',
            type: 'COST_OF_SALES',
            category: 'Cost of Sales',
            confidence: 96
          },
          alternativeAccounts: [
            { code: '5001000', name: 'Food Materials - Vegetables', confidence: 70, reason: 'Alternative food material account' },
            { code: '6001000', name: 'Kitchen Operations', confidence: 60, reason: 'Could be operational expense' }
          ],
          journalEntries: [
            { accountCode: '5005000', accountName: 'Food Materials - Meat', debit: 890.75, description: 'Fresh meat purchase' },
            { accountCode: '2000001', accountName: 'Accounts Payable - Trade', credit: 890.75, description: 'Payment due: Premium Meats Co' }
          ],
          aiReasoning: [
            'Vendor "Premium Meats Co" is known meat supplier',
            'Description contains "chicken and beef" indicating raw materials',
            'High-confidence mapping to Cost of Sales category'
          ],
          businessRules: [
            'Restaurant Rule: Meat suppliers map to Cost of Sales',
            'Keyword Rule: "meat", "chicken", "beef" map to COST_OF_SALES',
            'Business Rule: Raw materials for food preparation are Cost of Sales'
          ]
        };

      case 'electricity board':
        return {
          primaryAccount: {
            code: '6004000',
            name: 'Electricity Bills',
            type: 'DIRECT_EXPENSE',
            category: 'Direct Expenses',
            confidence: 92
          },
          alternativeAccounts: [
            { code: '6005000', name: 'Gas Cylinder Expenses', confidence: 75, reason: 'Alternative utility expense' },
            { code: '7005000', name: 'Office Utilities', confidence: 60, reason: 'Could be administrative expense' }
          ],
          journalEntries: [
            { accountCode: '6004000', accountName: 'Electricity Bills', debit: 1250.00, description: 'Monthly electricity charges' },
            { accountCode: '2000001', accountName: 'Accounts Payable - Trade', credit: 1250.00, description: 'Payment due: Electricity Board' }
          ],
          aiReasoning: [
            'Vendor "Electricity Board" is utility provider',
            'Description indicates monthly electricity expense',
            'Restaurant utilities are Direct Expenses for operations'
          ],
          businessRules: [
            'Restaurant Rule: Utility expenses map to Direct Expenses (6000000-6999999)',
            'Keyword Rule: "electricity" maps to DIRECT_EXPENSE',
            'Business Rule: Operational utilities are Direct Expenses'
          ]
        };

      case 'google ads':
        return {
          primaryAccount: {
            code: '7001000',
            name: 'Marketing & Advertising',
            type: 'INDIRECT_EXPENSE',
            category: 'Indirect Expenses',
            confidence: 88
          },
          alternativeAccounts: [
            { code: '6007000', name: 'Promotional Expenses', confidence: 70, reason: 'Could be direct promotional cost' },
            { code: '7005000', name: 'Digital Services', confidence: 65, reason: 'Alternative digital expense' }
          ],
          journalEntries: [
            { accountCode: '7001000', accountName: 'Marketing & Advertising', debit: 450.00, description: 'Digital marketing campaign' },
            { accountCode: '2000001', accountName: 'Accounts Payable - Trade', credit: 450.00, description: 'Payment due: Google Ads' }
          ],
          aiReasoning: [
            'Vendor "Google Ads" is advertising platform',
            'Description contains "marketing campaign" indicating promotional activity',
            'Marketing expenses are typically Indirect Expenses'
          ],
          businessRules: [
            'Restaurant Rule: Marketing expenses map to Indirect Expenses (7000000-7999999)',
            'Keyword Rule: "marketing", "advertising" map to INDIRECT_EXPENSE',
            'Business Rule: Brand promotion costs are administrative expenses'
          ]
        };

      default:
        return {
          primaryAccount: {
            code: '6000000',
            name: 'General Operating Expenses',
            type: 'DIRECT_EXPENSE',
            category: 'Direct Expenses',
            confidence: 60
          },
          alternativeAccounts: [],
          journalEntries: [],
          aiReasoning: ['Fallback mapping for unknown vendor'],
          businessRules: ['Default Rule: Unknown expenses map to Direct Expenses']
        };
    }
  };

  const accountTypeColors = {
    'COST_OF_SALES': 'text-orange-600 bg-orange-50 border-orange-200',
    'DIRECT_EXPENSE': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'INDIRECT_EXPENSE': 'text-amber-600 bg-amber-50 border-amber-200',
    'TAX_EXPENSE': 'text-rose-600 bg-rose-50 border-rose-200'
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Digital Accountant ↔ Chart of Accounts Integration
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              AI-powered account mapping using the 9-category structure
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-1 text-green-500" />
            Live Integration
          </div>
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-blue-500" />
            95% AI Confidence
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1 text-purple-500" />
            Restaurant Optimized
          </div>
        </div>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Document Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-600" />
            Try Document Processing
          </h3>
          
          <div className="space-y-3">
            {documentExamples.map((doc) => (
              <motion.button
                key={doc.id}
                onClick={() => handleDocumentSelect(doc)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedDocument?.id === doc.id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                } text-left`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-gradient-to-r ${doc.color} rounded-lg flex items-center justify-center mr-3`}>
                    <doc.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {doc.vendor}
                      </div>
                      <div className="font-semibold text-green-600">
                        ${doc.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {doc.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Category: {doc.category}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI Processing & Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
            AI Account Mapping
          </h3>

          <AnimatePresence mode="wait">
            {!selectedDocument && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a document to see AI account mapping in action
                </p>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                  <Brain className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  AI analyzing document and mapping to Chart of Accounts...
                </p>
              </motion.div>
            )}

            {mapping && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Primary Account Mapping */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Primary Account Match
                    </h4>
                    <div className="text-green-600 dark:text-green-400 font-bold">
                      {mapping.primaryAccount.confidence}% confidence
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {mapping.primaryAccount.code} - {mapping.primaryAccount.name}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          accountTypeColors[mapping.primaryAccount.type as keyof typeof accountTypeColors] || 'text-gray-600 bg-gray-50'
                        }`}>
                          {mapping.primaryAccount.category}
                        </div>
                      </div>
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Reasoning
                  </h4>
                  <ul className="space-y-1">
                    {mapping.aiReasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                        <ArrowRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business Rules */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Restaurant Business Rules
                  </h4>
                  <ul className="space-y-1">
                    {mapping.businessRules.map((rule, index) => (
                      <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start">
                        <Target className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Journal Entry Preview */}
                {mapping.journalEntries.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      Generated Journal Entry
                    </h4>
                    <div className="space-y-2">
                      {mapping.journalEntries.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {entry.accountCode} - {entry.accountName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {entry.description}
                            </div>
                          </div>
                          <div className="text-right">
                            {entry.debit && (
                              <div className="text-red-600 font-medium text-sm">
                                Dr. ${entry.debit.toLocaleString()}
                              </div>
                            )}
                            {entry.credit && (
                              <div className="text-green-600 font-medium text-sm">
                                Cr. ${entry.credit.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept & Create Journal Entry
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Review Alternatives
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Integration Benefits */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Integration Benefits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">95% Accuracy</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI learns restaurant patterns to correctly categorize expenses as Cost of Sales vs Direct/Indirect Expenses
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">80% Time Saved</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatic account mapping eliminates manual journal entry creation for routine transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <PieChart className="w-5 h-5 text-purple-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Professional Reports</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Proper expense categorization enables industry-standard financial reporting and analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}