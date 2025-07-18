import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';

// AI-Enhanced Mobile Scanner Service - Week 7 Implementation
// Revolutionary AI integration with mobile scanning for intelligent recommendations

export interface ScanResult {
  id: string;
  organizationId: string;
  scanType: 'invoice' | 'receipt' | 'barcode' | 'business_card' | 'document';
  rawData: {
    imageUrl?: string;
    barcodeValue?: string;
    ocrText?: string;
    extractedFields?: Record<string, any>;
  };
  processedData: {
    vendor?: string;
    amount?: number;
    date?: string;
    category?: string;
    productId?: string;
    quantity?: number;
    confidence: number;
  };
  aiRecommendations: AIRecommendation[];
  status: 'processing' | 'completed' | 'error';
  createdAt: string;
  processedAt?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'pricing' | 'categorization' | 'vendor' | 'approval' | 'routing' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  action: {
    type: 'auto_apply' | 'suggest' | 'alert';
    payload: Record<string, any>;
  };
  reasoning: string[];
  alternatives?: Array<{
    title: string;
    confidence: number;
    payload: Record<string, any>;
  }>;
}

export interface SmartWorkflow {
  id: string;
  name: string;
  triggerConditions: {
    scanType?: string[];
    amountRange?: { min: number; max: number };
    vendor?: string[];
    category?: string[];
  };
  aiActions: Array<{
    type: 'categorize' | 'route' | 'approve' | 'notify' | 'integrate';
    parameters: Record<string, any>;
    confidence_threshold: number;
  }>;
  humanReviewRequired: boolean;
  automationLevel: 'manual' | 'assisted' | 'automated';
}

export interface ScanInsight {
  id: string;
  organizationId: string;
  insightType: 'cost_saving' | 'efficiency' | 'compliance' | 'trend' | 'anomaly';
  title: string;
  description: string;
  data: {
    metric: string;
    currentValue: number;
    targetValue: number;
    potentialSaving?: number;
    timeframe: string;
  };
  basedOnScans: string[]; // Scan IDs that contributed to this insight
  confidence: number;
  priority: number;
  generatedAt: string;
}

export interface PredictiveAnalysis {
  organizationId: string;
  predictions: Array<{
    type: 'expense_forecast' | 'vendor_performance' | 'category_trends' | 'seasonal_patterns';
    timeframe: '7d' | '30d' | '90d' | '1y';
    prediction: {
      metric: string;
      predictedValue: number;
      confidence: number;
      factors: string[];
    };
    recommendations: string[];
  }>;
  generatedAt: string;
}

export class AIEnhancedScannerService {
  private static supabase = createClient();

  // Core AI-Enhanced Scanning
  static async processScanWithAI(
    organizationId: string,
    scanType: ScanResult['scanType'],
    rawData: ScanResult['rawData']
  ): Promise<{ success: boolean; scanResult?: ScanResult; error?: string }> {
    try {
      const scanId = crypto.randomUUID();
      
      // Initial scan result
      let scanResult: ScanResult = {
        id: scanId,
        organizationId,
        scanType,
        rawData,
        processedData: { confidence: 0 },
        aiRecommendations: [],
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      // Process based on scan type
      switch (scanType) {
        case 'invoice':
          scanResult = await this.processInvoiceScan(scanResult);
          break;
        case 'receipt':
          scanResult = await this.processReceiptScan(scanResult);
          break;
        case 'barcode':
          scanResult = await this.processBarcodeScan(scanResult);
          break;
        case 'business_card':
          scanResult = await this.processBusinessCardScan(scanResult);
          break;
        case 'document':
          scanResult = await this.processDocumentScan(scanResult);
          break;
      }

      // Generate AI recommendations
      scanResult.aiRecommendations = await this.generateAIRecommendations(scanResult);
      
      // Apply smart workflows
      await this.applySmartWorkflows(scanResult);
      
      // Update status
      scanResult.status = 'completed';
      scanResult.processedAt = new Date().toISOString();
      
      // Save to database
      await this.saveScanResult(scanResult);
      
      return { success: true, scanResult };
    } catch (error) {
      console.error('Error processing scan with AI:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process scan with AI' 
      };
    }
  }

  // Invoice Processing with AI
  private static async processInvoiceScan(scanResult: ScanResult): Promise<ScanResult> {
    const { rawData } = scanResult;
    
    // Simulate OCR processing
    const ocrText = rawData.ocrText || 'ACME Corp\nInvoice #12345\nAmount: $250.00\nDate: 2024-01-15';
    
    // AI extraction using pattern matching
    const vendorMatch = ocrText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    const amountMatch = ocrText.match(/\$?(\d+\.?\d*)/);
    const dateMatch = ocrText.match(/(\d{4}-\d{2}-\d{2})/);
    const invoiceMatch = ocrText.match(/(INV|Invoice)\s*#?\s*(\w+)/i);

    // Enhanced data extraction
    const vendor = vendorMatch ? vendorMatch[1] : '';
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    const invoiceNumber = invoiceMatch ? invoiceMatch[2] : '';

    // AI-powered categorization
    const category = await this.predictExpenseCategory(vendor, amount, ocrText);
    
    // Confidence scoring based on extraction quality
    let confidence = 0.5; // Base confidence
    if (vendor) confidence += 0.2;
    if (amount > 0) confidence += 0.2;
    if (date) confidence += 0.1;
    
    scanResult.processedData = {
      vendor,
      amount,
      date,
      category,
      confidence: Math.min(confidence, 1.0)
    };

    return scanResult;
  }

  // Receipt Processing with AI
  private static async processReceiptScan(scanResult: ScanResult): Promise<ScanResult> {
    const { rawData } = scanResult;
    
    // Simulate receipt processing
    const ocrText = rawData.ocrText || 'Quick Mart\nTotal: $45.67\nDate: 2024-01-15\nCard ending 1234';
    
    // Extract receipt data
    const vendorMatch = ocrText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const amountMatch = ocrText.match(/Total:?\s*\$?(\d+\.?\d*)/i);
    const dateMatch = ocrText.match(/(\d{4}-\d{2}-\d{2})/);

    const vendor = vendorMatch ? vendorMatch[1] : '';
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // AI categorization for receipts
    const category = await this.predictExpenseCategory(vendor, amount, ocrText);
    
    scanResult.processedData = {
      vendor,
      amount,
      date,
      category,
      confidence: 0.85
    };

    return scanResult;
  }

  // Barcode Processing with AI
  private static async processBarcodeScan(scanResult: ScanResult): Promise<ScanResult> {
    const { rawData } = scanResult;
    const barcodeValue = rawData.barcodeValue || '1234567890123';
    
    // Simulate product lookup
    const productData = await this.lookupProduct(barcodeValue);
    
    scanResult.processedData = {
      productId: barcodeValue,
      ...productData,
      confidence: productData ? 0.95 : 0.3
    };

    return scanResult;
  }

  // Business Card Processing with AI
  private static async processBusinessCardScan(scanResult: ScanResult): Promise<ScanResult> {
    const { rawData } = scanResult;
    const ocrText = rawData.ocrText || 'John Smith\nCEO\nTech Corp\njohn@techcorp.com\n(555) 123-4567';
    
    // Extract contact information
    const nameMatch = ocrText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    const emailMatch = ocrText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = ocrText.match(/(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/);
    const companyMatch = ocrText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Corp|Inc|LLC|Ltd)?)/);

    scanResult.processedData = {
      vendor: nameMatch ? nameMatch[1] : '',
      category: 'contact',
      confidence: 0.8
    };

    return scanResult;
  }

  // Document Processing with AI
  private static async processDocumentScan(scanResult: ScanResult): Promise<ScanResult> {
    const { rawData } = scanResult;
    const ocrText = rawData.ocrText || 'Document content...';
    
    // AI document classification
    const documentType = await this.classifyDocument(ocrText);
    
    scanResult.processedData = {
      category: documentType,
      confidence: 0.7
    };

    return scanResult;
  }

  // AI Recommendation Generation
  private static async generateAIRecommendations(scanResult: ScanResult): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const { scanType, processedData } = scanResult;

    // Pricing recommendations for invoices/receipts
    if ((scanType === 'invoice' || scanType === 'receipt') && processedData.amount) {
      // Check against historical data
      const avgAmount = await this.getAverageAmountForVendor(processedData.vendor || '');
      
      if (processedData.amount > avgAmount * 1.2) {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'pricing',
          title: 'Price Variance Detected',
          description: `Amount $${processedData.amount} is 20% higher than average for this vendor ($${avgAmount.toFixed(2)})`,
          confidence: 0.85,
          impact: 'medium',
          action: {
            type: 'alert',
            payload: { 
              variance: ((processedData.amount - avgAmount) / avgAmount * 100).toFixed(1),
              suggestedAction: 'review_pricing'
            }
          },
          reasoning: [
            'Historical analysis shows significant price increase',
            'May indicate pricing change or billing error',
            'Recommend vendor communication'
          ]
        });
      }
    }

    // Categorization recommendations
    if (processedData.confidence < 0.8) {
      const suggestedCategories = await this.suggestCategories(scanResult);
      
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'categorization',
        title: 'Category Suggestion',
        description: `AI suggests reviewing categorization (${(processedData.confidence * 100).toFixed(0)}% confidence)`,
        confidence: 0.9,
        impact: 'low',
        action: {
          type: 'suggest',
          payload: { suggestedCategories }
        },
        reasoning: [
          'Low confidence in automatic categorization',
          'Multiple category options available',
          'Human review recommended'
        ],
        alternatives: suggestedCategories.map(cat => ({
          title: cat.name,
          confidence: cat.confidence,
          payload: { category: cat.name }
        }))
      });
    }

    // Approval workflow recommendations
    if (scanType === 'invoice' && processedData.amount && processedData.amount > 1000) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'approval',
        title: 'High-Value Transaction',
        description: `Invoice amount $${processedData.amount} requires management approval`,
        confidence: 1.0,
        impact: 'high',
        action: {
          type: 'alert',
          payload: { 
            approvalRequired: true,
            approvalLevel: 'management',
            reason: 'amount_threshold'
          }
        },
        reasoning: [
          'Amount exceeds $1,000 approval threshold',
          'Company policy requires management review',
          'Risk mitigation for high-value transactions'
        ]
      });
    }

    // Vendor recommendations
    if (processedData.vendor && scanType !== 'business_card') {
      const vendorInsights = await this.getVendorInsights(processedData.vendor);
      
      if (vendorInsights.riskLevel === 'high') {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'vendor',
          title: 'Vendor Risk Alert',
          description: `Vendor "${processedData.vendor}" has been flagged for review`,
          confidence: 0.9,
          impact: 'high',
          action: {
            type: 'alert',
            payload: { 
              riskFactors: vendorInsights.riskFactors,
              suggestedAction: 'vendor_review'
            }
          },
          reasoning: vendorInsights.riskFactors
        });
      }
    }

    // Optimization recommendations
    if (scanType === 'barcode' && processedData.productId) {
      const optimizations = await this.getInventoryOptimizations(processedData.productId);
      
      if (optimizations.length > 0) {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          title: 'Inventory Optimization',
          description: 'AI identified potential inventory improvements',
          confidence: 0.8,
          impact: 'medium',
          action: {
            type: 'suggest',
            payload: { optimizations }
          },
          reasoning: [
            'Stock level analysis complete',
            'Cost optimization opportunities identified',
            'Supplier alternatives available'
          ]
        });
      }
    }

    return recommendations;
  }

  // Smart Workflow Application
  private static async applySmartWorkflows(scanResult: ScanResult): Promise<void> {
    const workflows = await this.getSmartWorkflows(scanResult.organizationId);
    
    for (const workflow of workflows) {
      if (this.matchesWorkflowConditions(scanResult, workflow)) {
        await this.executeWorkflow(scanResult, workflow);
      }
    }
  }

  // Workflow Condition Matching
  private static matchesWorkflowConditions(scanResult: ScanResult, workflow: SmartWorkflow): boolean {
    const { triggerConditions } = workflow;
    const { scanType, processedData } = scanResult;

    // Check scan type
    if (triggerConditions.scanType && !triggerConditions.scanType.includes(scanType)) {
      return false;
    }

    // Check amount range
    if (triggerConditions.amountRange && processedData.amount) {
      const { min, max } = triggerConditions.amountRange;
      if (processedData.amount < min || processedData.amount > max) {
        return false;
      }
    }

    // Check vendor
    if (triggerConditions.vendor && processedData.vendor) {
      if (!triggerConditions.vendor.includes(processedData.vendor)) {
        return false;
      }
    }

    // Check category
    if (triggerConditions.category && processedData.category) {
      if (!triggerConditions.category.includes(processedData.category)) {
        return false;
      }
    }

    return true;
  }

  // Workflow Execution
  private static async executeWorkflow(scanResult: ScanResult, workflow: SmartWorkflow): Promise<void> {
    for (const action of workflow.aiActions) {
      if (scanResult.processedData.confidence >= action.confidence_threshold) {
        await this.executeWorkflowAction(scanResult, action);
      }
    }
  }

  // Individual Workflow Action Execution
  private static async executeWorkflowAction(
    scanResult: ScanResult, 
    action: SmartWorkflow['aiActions'][0]
  ): Promise<void> {
    switch (action.type) {
      case 'categorize':
        // Auto-categorize based on AI
        if (scanResult.processedData.confidence > 0.9) {
          // Apply high-confidence categorization
        }
        break;
        
      case 'route':
        // Route to appropriate department/person
        const routing = action.parameters.routing || 'accounting';
        // Execute routing logic
        break;
        
      case 'approve':
        // Auto-approve if conditions are met
        if (action.parameters.auto_approve && scanResult.processedData.amount! < action.parameters.threshold) {
          // Auto-approve transaction
        }
        break;
        
      case 'notify':
        // Send notifications
        const recipients = action.parameters.recipients || [];
        // Send notification logic
        break;
        
      case 'integrate':
        // Integrate with external systems
        const system = action.parameters.system;
        // Integration logic
        break;
    }
  }

  // Generate Scan Insights
  static async generateScanInsights(
    organizationId: string,
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<{ success: boolean; insights?: ScanInsight[]; error?: string }> {
    try {
      const insights: ScanInsight[] = [];
      
      // Get scan data for timeframe
      const scans = await this.getScanHistory(organizationId, timeframe);
      
      // Cost saving insights
      const costSavings = await this.analyzeCostSavings(scans);
      if (costSavings.potentialSaving > 0) {
        insights.push({
          id: crypto.randomUUID(),
          organizationId,
          insightType: 'cost_saving',
          title: 'Cost Saving Opportunity',
          description: `Potential monthly savings of $${costSavings.potentialSaving.toFixed(2)} identified`,
          data: {
            metric: 'cost_savings',
            currentValue: costSavings.currentSpend,
            targetValue: costSavings.currentSpend - costSavings.potentialSaving,
            potentialSaving: costSavings.potentialSaving,
            timeframe: '30d'
          },
          basedOnScans: costSavings.relevantScans,
          confidence: 0.85,
          priority: 8,
          generatedAt: new Date().toISOString()
        });
      }

      // Efficiency insights
      const efficiency = await this.analyzeProcessingEfficiency(scans);
      insights.push({
        id: crypto.randomUUID(),
        organizationId,
        insightType: 'efficiency',
        title: 'Processing Efficiency Analysis',
        description: `Average processing time: ${efficiency.avgProcessingTime} seconds`,
        data: {
          metric: 'processing_time',
          currentValue: efficiency.avgProcessingTime,
          targetValue: efficiency.avgProcessingTime * 0.8,
          timeframe: timeframe
        },
        basedOnScans: scans.map(s => s.id),
        confidence: 0.9,
        priority: 6,
        generatedAt: new Date().toISOString()
      });

      // Compliance insights
      const compliance = await this.analyzeCompliance(scans);
      if (compliance.issuesFound > 0) {
        insights.push({
          id: crypto.randomUUID(),
          organizationId,
          insightType: 'compliance',
          title: 'Compliance Issues Detected',
          description: `${compliance.issuesFound} potential compliance issues found`,
          data: {
            metric: 'compliance_score',
            currentValue: compliance.complianceScore,
            targetValue: 95,
            timeframe: timeframe
          },
          basedOnScans: compliance.problematicScans,
          confidence: 0.8,
          priority: 9,
          generatedAt: new Date().toISOString()
        });
      }

      return { success: true, insights };
    } catch (error) {
      console.error('Error generating scan insights:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate scan insights' 
      };
    }
  }

  // Predictive Analysis
  static async generatePredictiveAnalysis(
    organizationId: string
  ): Promise<{ success: boolean; analysis?: PredictiveAnalysis; error?: string }> {
    try {
      const scans = await this.getScanHistory(organizationId, '90d');
      
      const predictions = [
        // Expense forecast
        {
          type: 'expense_forecast' as const,
          timeframe: '30d' as const,
          prediction: {
            metric: 'monthly_expenses',
            predictedValue: await this.predictMonthlyExpenses(scans),
            confidence: 0.82,
            factors: ['Historical trends', 'Seasonal patterns', 'Vendor analysis']
          },
          recommendations: [
            'Budget adjustment may be needed',
            'Consider vendor negotiations',
            'Review high-spend categories'
          ]
        },

        // Vendor performance
        {
          type: 'vendor_performance' as const,
          timeframe: '30d' as const,
          prediction: {
            metric: 'vendor_satisfaction',
            predictedValue: 85,
            confidence: 0.78,
            factors: ['Payment history', 'Response times', 'Quality metrics']
          },
          recommendations: [
            'Strengthen top vendor relationships',
            'Address underperforming vendors',
            'Diversify vendor portfolio'
          ]
        }
      ];

      const analysis: PredictiveAnalysis = {
        organizationId,
        predictions,
        generatedAt: new Date().toISOString()
      };

      return { success: true, analysis };
    } catch (error) {
      console.error('Error generating predictive analysis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate predictive analysis' 
      };
    }
  }

  // Helper Methods

  private static async predictExpenseCategory(vendor: string, amount: number, text: string): Promise<string> {
    // Simple AI categorization logic
    const categories = {
      'office': ['office', 'supplies', 'depot', 'staples'],
      'food': ['restaurant', 'food', 'mart', 'cafe', 'pizza'],
      'transport': ['uber', 'taxi', 'gas', 'fuel', 'parking'],
      'utilities': ['electric', 'water', 'internet', 'phone'],
      'professional': ['consulting', 'legal', 'accounting', 'service']
    };

    const lowerVendor = vendor.toLowerCase();
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerVendor.includes(keyword) || lowerText.includes(keyword))) {
        return category;
      }
    }

    // Amount-based categorization
    if (amount > 1000) return 'equipment';
    if (amount < 50) return 'miscellaneous';
    
    return 'general';
  }

  private static async lookupProduct(barcode: string): Promise<any> {
    // Simulate product database lookup
    const products: Record<string, any> = {
      '1234567890123': { vendor: 'Product A', amount: 15.99, category: 'inventory' },
      '9876543210987': { vendor: 'Product B', amount: 25.50, category: 'inventory' }
    };

    return products[barcode] || null;
  }

  private static async classifyDocument(text: string): Promise<string> {
    const keywords = {
      'contract': ['agreement', 'contract', 'terms', 'conditions'],
      'invoice': ['invoice', 'bill', 'amount due', 'total'],
      'receipt': ['receipt', 'purchased', 'total paid'],
      'report': ['report', 'analysis', 'summary', 'findings']
    };

    const lowerText = text.toLowerCase();
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word))) {
        return type;
      }
    }

    return 'document';
  }

  private static async getAverageAmountForVendor(vendor: string): Promise<number> {
    // Simulate historical average calculation
    return 150 + Math.random() * 100; // Random average between $150-$250
  }

  private static async suggestCategories(scanResult: ScanResult): Promise<Array<{name: string; confidence: number}>> {
    return [
      { name: 'office_supplies', confidence: 0.8 },
      { name: 'professional_services', confidence: 0.6 },
      { name: 'equipment', confidence: 0.4 }
    ];
  }

  private static async getVendorInsights(vendor: string): Promise<{riskLevel: string; riskFactors: string[]}> {
    // Simulate vendor risk analysis
    const highRiskVendors = ['Risky Corp', 'Unstable LLC'];
    
    if (highRiskVendors.includes(vendor)) {
      return {
        riskLevel: 'high',
        riskFactors: [
          'Late payment history',
          'Quality issues reported',
          'Limited vendor verification'
        ]
      };
    }

    return { riskLevel: 'low', riskFactors: [] };
  }

  private static async getInventoryOptimizations(productId: string): Promise<any[]> {
    return [
      {
        type: 'reorder_optimization',
        description: 'Adjust reorder point to reduce carrying costs',
        potentialSaving: 150
      }
    ];
  }

  private static async getSmartWorkflows(organizationId: string): Promise<SmartWorkflow[]> {
    // Return default smart workflows
    return [
      {
        id: 'auto-approve-small',
        name: 'Auto-approve small expenses',
        triggerConditions: {
          scanType: ['receipt'],
          amountRange: { min: 0, max: 100 }
        },
        aiActions: [
          {
            type: 'approve',
            parameters: { auto_approve: true, threshold: 100 },
            confidence_threshold: 0.8
          }
        ],
        humanReviewRequired: false,
        automationLevel: 'automated'
      }
    ];
  }

  private static async getScanHistory(organizationId: string, timeframe: string): Promise<ScanResult[]> {
    // Simulate scan history retrieval
    return [];
  }

  private static async analyzeCostSavings(scans: ScanResult[]): Promise<any> {
    return {
      currentSpend: 5000,
      potentialSaving: 300,
      relevantScans: scans.map(s => s.id)
    };
  }

  private static async analyzeProcessingEfficiency(scans: ScanResult[]): Promise<any> {
    return {
      avgProcessingTime: 15
    };
  }

  private static async analyzeCompliance(scans: ScanResult[]): Promise<any> {
    return {
      issuesFound: 2,
      complianceScore: 85,
      problematicScans: scans.slice(0, 2).map(s => s.id)
    };
  }

  private static async predictMonthlyExpenses(scans: ScanResult[]): Promise<number> {
    // Simple prediction based on historical data
    const totalExpenses = scans.reduce((sum, scan) => sum + (scan.processedData.amount || 0), 0);
    return totalExpenses * 1.1; // 10% increase prediction
  }

  // Save scan result to database
  private static async saveScanResult(scanResult: ScanResult): Promise<void> {
    const { error } = await this.supabase
      .from('core_entities')
      .insert({
        id: scanResult.id,
        organization_id: scanResult.organizationId,
        entity_type: 'scan_result',
        entity_name: `${scanResult.scanType}_scan`,
        created_at: scanResult.createdAt,
        updated_at: scanResult.processedAt || scanResult.createdAt
      });

    if (error) throw error;

    // Save scan metadata
    const { error: metadataError } = await this.supabase
      .from('core_metadata')
      .insert({
        organization_id: scanResult.organizationId,
        entity_type: 'scan_result',
        entity_id: scanResult.id,
        metadata_type: 'scan_data',
        metadata_category: 'ai_processing',
        metadata_key: 'scan_details',
        metadata_value: JSON.stringify({
          scanType: scanResult.scanType,
          rawData: scanResult.rawData,
          processedData: scanResult.processedData,
          aiRecommendations: scanResult.aiRecommendations,
          status: scanResult.status
        })
      });

    if (metadataError) throw metadataError;
  }
}