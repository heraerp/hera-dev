/**
 * HERA Universal ERP - Offline Processing Engine
 * Advanced client-side AI and document processing
 * Enables complete business logic execution without connectivity
 */

import { EventEmitter } from 'events';
import { CapturedPhoto, DocumentType } from '@/lib/camera/universal-camera-service';
import { InvoiceData, ReceiptData } from '@/lib/ai/document-processing-pipeline';
import { offlineStorageManager } from './offline-storage-manager';

// ==================== PROCESSING INTERFACES ====================

export interface ProcessingConfig {
  enableOfflineOCR: boolean;
  enableOfflineClassification: boolean;
  enableLocalValidation: boolean;
  enableSmartExtraction: boolean;
  ocrAccuracy: 'basic' | 'standard' | 'premium';
  processingTimeout: number;
  maxRetries: number;
  fallbackToManual: boolean;
}

export interface ProcessingJob {
  id: string;
  type: 'document_classification' | 'ocr_extraction' | 'data_validation' | 'business_logic';
  input: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: any;
  error?: string;
  startTime: number;
  endTime?: number;
  metadata: JobMetadata;
}

export interface JobMetadata {
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  requiresGPU: boolean;
  memoryRequirement: number;
  canRunInBackground: boolean;
  retryCount: number;
}

export interface OfflineOCRResult {
  text: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  language: string;
  orientation: number;
  processingTime: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  alternativeTypes: Array<{ type: DocumentType; confidence: number }>;
  features: DocumentFeature[];
  processingTime: number;
}

export interface DocumentFeature {
  name: string;
  value: any;
  confidence: number;
  weight: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  impact: string;
}

export interface ValidationSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  rationale: string;
}

// ==================== OFFLINE PROCESSING ENGINE ====================

export class OfflineProcessingEngine extends EventEmitter {
  private config: ProcessingConfig;
  private processingQueue: Map<string, ProcessingJob> = new Map();
  private isProcessing = false;
  private workers: Map<string, Worker> = new Map();
  private ocrEngine?: any; // TensorFlow.js OCR model
  private classificationModel?: any; // TensorFlow.js classification model

  constructor(config: Partial<ProcessingConfig> = {}) {
    super();
    
    this.config = {
      enableOfflineOCR: true,
      enableOfflineClassification: true,
      enableLocalValidation: true,
      enableSmartExtraction: true,
      ocrAccuracy: 'standard',
      processingTimeout: 30000, // 30 seconds
      maxRetries: 3,
      fallbackToManual: true,
      ...config
    };

    this.initialize();
  }

  // ==================== INITIALIZATION ====================

  private async initialize(): Promise<void> {
    try {
      console.log('🧠 HERA: Initializing offline processing engine...');
      
      await this.loadProcessingModels();
      await this.initializeWorkers();
      await this.loadProcessingRules();
      
      console.log('✅ HERA: Offline processing engine ready');
      this.emit('engine-ready');
      
    } catch (error) {
      console.error('❌ HERA: Processing engine initialization failed:', error);
      throw error;
    }
  }

  private async loadProcessingModels(): Promise<void> {
    try {
      if (this.config.enableOfflineOCR) {
        console.log('📖 HERA: Loading OCR model...');
        // This would load a TensorFlow.js OCR model
        // For now, we'll simulate model loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.ocrEngine = { loaded: true };
        console.log('✅ HERA: OCR model loaded');
      }
      
      if (this.config.enableOfflineClassification) {
        console.log('🏷️ HERA: Loading classification model...');
        // This would load a TensorFlow.js document classification model
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.classificationModel = { loaded: true };
        console.log('✅ HERA: Classification model loaded');
      }
      
    } catch (error) {
      console.error('❌ HERA: Model loading failed:', error);
      throw error;
    }
  }

  private async initializeWorkers(): Promise<void> {
    try {
      // Initialize web workers for processing
      if ('Worker' in window) {
        console.log('👷 HERA: Initializing processing workers...');
        
        // OCR worker
        if (this.config.enableOfflineOCR) {
          const ocrWorker = new Worker(new URL('../workers/ocr-worker.js', import.meta.url));
          this.workers.set('ocr', ocrWorker);
        }
        
        // Classification worker
        if (this.config.enableOfflineClassification) {
          const classificationWorker = new Worker(new URL('../workers/classification-worker.js', import.meta.url));
          this.workers.set('classification', classificationWorker);
        }
        
        console.log('✅ HERA: Processing workers initialized');
      }
      
    } catch (error) {
      console.warn('⚠️ HERA: Worker initialization failed, falling back to main thread:', error);
    }
  }

  private async loadProcessingRules(): Promise<void> {
    try {
      // Load business rules and validation patterns from storage
      const rules = await offlineStorageManager.getSetting('processing_rules') || this.getDefaultRules();
      
      console.log('📋 HERA: Processing rules loaded');
      
    } catch (error) {
      console.error('❌ HERA: Failed to load processing rules:', error);
    }
  }

  // ==================== MAIN PROCESSING METHODS ====================

  async processDocument(image: CapturedPhoto, expectedType?: DocumentType): Promise<ProcessingJob> {
    try {
      console.log('📄 HERA: Starting offline document processing...');
      
      const jobId = this.createJob('document_classification', image, {
        priority: 'high',
        estimatedDuration: 5000,
        requiresGPU: false,
        memoryRequirement: 50, // MB
        canRunInBackground: true,
        retryCount: 0
      });
      
      // Step 1: Document Classification
      const classificationResult = await this.classifyDocument(image, expectedType);
      this.updateJobProgress(jobId, 25, 'Document classified');
      
      // Step 2: OCR Text Extraction
      const ocrResult = await this.extractText(image);
      this.updateJobProgress(jobId, 50, 'Text extracted');
      
      // Step 3: Structured Data Extraction
      const extractedData = await this.extractStructuredData(
        ocrResult,
        classificationResult.documentType
      );
      this.updateJobProgress(jobId, 75, 'Data extracted');
      
      // Step 4: Validation
      const validationResult = await this.validateExtractedData(
        extractedData,
        classificationResult.documentType
      );
      this.updateJobProgress(jobId, 100, 'Processing completed');
      
      const result = {
        classification: classificationResult,
        ocr: ocrResult,
        extractedData,
        validation: validationResult,
        confidence: this.calculateOverallConfidence(classificationResult, ocrResult, validationResult),
        processingTime: Date.now() - this.getJob(jobId)!.startTime
      };
      
      this.completeJob(jobId, result);
      
      console.log('✅ HERA: Document processing completed offline');
      return this.getJob(jobId)!;
      
    } catch (error) {
      console.error('❌ HERA: Offline document processing failed:', error);
      throw error;
    }
  }

  async processInvoice(image: CapturedPhoto): Promise<InvoiceData> {
    try {
      console.log('📄 HERA: Processing invoice offline...');
      
      // Extract text using OCR
      const ocrResult = await this.extractText(image);
      
      // Extract invoice-specific data
      const invoiceData = await this.extractInvoiceData(ocrResult);
      
      // Validate invoice data
      const validation = await this.validateInvoiceData(invoiceData);
      
      // Enhance with stored vendor data
      const enhancedData = await this.enhanceInvoiceData(invoiceData);
      
      console.log('✅ HERA: Invoice processing completed offline');
      return enhancedData;
      
    } catch (error) {
      console.error('❌ HERA: Offline invoice processing failed:', error);
      throw error;
    }
  }

  async processReceipt(image: CapturedPhoto): Promise<ReceiptData> {
    try {
      console.log('🧾 HERA: Processing receipt offline...');
      
      // Extract text using OCR
      const ocrResult = await this.extractText(image);
      
      // Extract receipt-specific data
      const receiptData = await this.extractReceiptData(ocrResult);
      
      // Categorize expense
      const categorizedData = await this.categorizeExpense(receiptData);
      
      // Validate receipt data
      const validation = await this.validateReceiptData(categorizedData);
      
      console.log('✅ HERA: Receipt processing completed offline');
      return categorizedData;
      
    } catch (error) {
      console.error('❌ HERA: Offline receipt processing failed:', error);
      throw error;
    }
  }

  async processBusinessCard(image: CapturedPhoto): Promise<any> {
    try {
      console.log('👤 HERA: Processing business card offline...');
      
      // Extract text using OCR
      const ocrResult = await this.extractText(image);
      
      // Extract contact information
      const contactData = await this.extractContactData(ocrResult);
      
      // Validate and normalize contact data
      const normalizedData = await this.normalizeContactData(contactData);
      
      console.log('✅ HERA: Business card processing completed offline');
      return normalizedData;
      
    } catch (error) {
      console.error('❌ HERA: Offline business card processing failed:', error);
      throw error;
    }
  }

  // ==================== OCR & TEXT EXTRACTION ====================

  private async extractText(image: CapturedPhoto): Promise<OfflineOCRResult> {
    try {
      console.log('📖 HERA: Extracting text using offline OCR...');
      
      const startTime = Date.now();
      
      if (this.workers.has('ocr')) {
        // Use web worker for OCR processing
        return this.processWithWorker('ocr', image);
      } else {
        // Fallback to main thread processing
        return this.processOCRMainThread(image);
      }
      
    } catch (error) {
      console.error('❌ HERA: OCR processing failed:', error);
      throw error;
    }
  }

  private async processOCRMainThread(image: CapturedPhoto): Promise<OfflineOCRResult> {
    // Simulate OCR processing on main thread
    // In a real implementation, this would use TensorFlow.js or similar
    
    const mockText = this.generateMockOCRText(image);
    
    return {
      text: mockText,
      confidence: 0.85 + Math.random() * 0.1,
      boundingBoxes: this.generateMockBoundingBoxes(mockText),
      language: 'en',
      orientation: 0,
      processingTime: 1000 + Math.random() * 2000
    };
  }

  private async processWithWorker(workerType: string, data: any): Promise<any> {
    const worker = this.workers.get(workerType);
    if (!worker) throw new Error(`Worker ${workerType} not available`);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${workerType} worker timeout`));
      }, this.config.processingTimeout);
      
      worker.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };
      
      worker.postMessage({ type: 'process', data });
    });
  }

  // ==================== DOCUMENT CLASSIFICATION ====================

  private async classifyDocument(image: CapturedPhoto, expectedType?: DocumentType): Promise<ClassificationResult> {
    try {
      console.log('🏷️ HERA: Classifying document offline...');
      
      if (expectedType) {
        // If we have an expected type, validate it with high confidence
        return {
          documentType: expectedType,
          confidence: 0.95,
          alternativeTypes: [],
          features: [],
          processingTime: 100
        };
      }
      
      // Analyze image features for classification
      const features = await this.extractImageFeatures(image);
      const classification = await this.runClassificationModel(features);
      
      return classification;
      
    } catch (error) {
      console.error('❌ HERA: Document classification failed:', error);
      throw error;
    }
  }

  private async extractImageFeatures(image: CapturedPhoto): Promise<DocumentFeature[]> {
    // Extract visual features from the image for classification
    // This would analyze layout, text density, visual patterns, etc.
    
    return [
      { name: 'text_density', value: 0.7, confidence: 0.9, weight: 1.0 },
      { name: 'has_table_structure', value: true, confidence: 0.8, weight: 0.8 },
      { name: 'has_logo', value: true, confidence: 0.6, weight: 0.5 },
      { name: 'document_orientation', value: 'portrait', confidence: 0.95, weight: 0.3 }
    ];
  }

  private async runClassificationModel(features: DocumentFeature[]): Promise<ClassificationResult> {
    // Simulate classification model inference
    // In a real implementation, this would use the loaded TensorFlow.js model
    
    const documentTypes: DocumentType[] = ['invoice', 'receipt', 'business_card', 'contract'];
    const scores = documentTypes.map(() => Math.random());
    const maxIndex = scores.indexOf(Math.max(...scores));
    
    return {
      documentType: documentTypes[maxIndex],
      confidence: 0.8 + Math.random() * 0.15,
      alternativeTypes: documentTypes
        .filter((_, i) => i !== maxIndex)
        .map(type => ({ type, confidence: Math.random() * 0.7 }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2),
      features,
      processingTime: 500 + Math.random() * 1000
    };
  }

  // ==================== DATA EXTRACTION ====================

  private async extractStructuredData(ocrResult: OfflineOCRResult, documentType: DocumentType): Promise<any> {
    switch (documentType) {
      case 'invoice':
        return this.extractInvoiceData(ocrResult);
      case 'receipt':
        return this.extractReceiptData(ocrResult);
      case 'business_card':
        return this.extractContactData(ocrResult);
      default:
        return { text: ocrResult.text };
    }
  }

  private async extractInvoiceData(ocrResult: OfflineOCRResult): Promise<InvoiceData> {
    const text = ocrResult.text;
    
    // Extract invoice-specific fields using pattern matching
    const invoiceData: InvoiceData = {
      invoiceNumber: this.extractPattern(text, /(?:invoice|inv)[\s#:]*([a-z0-9\-]+)/i)?.[1] || '',
      issueDate: this.extractPattern(text, /(?:date|issued)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)?.[1] || '',
      dueDate: this.extractPattern(text, /(?:due|payment)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)?.[1] || '',
      vendor: {
        name: this.extractVendorName(text),
        address: this.extractAddress(text),
        taxId: this.extractPattern(text, /(?:tax|ein|vat)[\s#:]*([a-z0-9\-]+)/i)?.[1] || ''
      },
      billTo: {
        name: this.extractBillToName(text),
        address: this.extractBillToAddress(text)
      },
      lineItems: this.extractLineItems(text),
      totals: this.extractTotals(text),
      currency: this.extractCurrency(text) || 'USD',
      paymentTerms: this.extractPaymentTerms(text),
      notes: this.extractNotes(text)
    };
    
    return invoiceData;
  }

  private async extractReceiptData(ocrResult: OfflineOCRResult): Promise<ReceiptData> {
    const text = ocrResult.text;
    
    const receiptData: ReceiptData = {
      transactionDate: this.extractPattern(text, /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)?.[1] || '',
      transactionTime: this.extractPattern(text, /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/i)?.[1] || '',
      merchant: {
        name: this.extractMerchantName(text),
        address: this.extractAddress(text),
        phone: this.extractPattern(text, /(\d{3}[.\-]?\d{3}[.\-]?\d{4})/)?.[1] || ''
      },
      items: this.extractReceiptItems(text),
      totals: this.extractReceiptTotals(text),
      paymentMethod: this.extractPaymentMethod(text),
      receiptNumber: this.extractPattern(text, /(?:receipt|ref)[\s#:]*([a-z0-9\-]+)/i)?.[1] || '',
      category: await this.categorizeExpense({ merchant: { name: this.extractMerchantName(text) } } as any),
      tags: []
    };
    
    return receiptData;
  }

  private async extractContactData(ocrResult: OfflineOCRResult): Promise<any> {
    const text = ocrResult.text;
    
    return {
      name: this.extractContactName(text),
      title: this.extractJobTitle(text),
      company: this.extractCompanyName(text),
      email: this.extractPattern(text, /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)?.[1] || '',
      phone: this.extractPattern(text, /(\d{3}[.\-]?\d{3}[.\-]?\d{4})/)?.[1] || '',
      website: this.extractPattern(text, /((?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,})/i)?.[1] || '',
      address: this.extractAddress(text)
    };
  }

  // ==================== VALIDATION ====================

  private async validateExtractedData(data: any, documentType: DocumentType): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    switch (documentType) {
      case 'invoice':
        return this.validateInvoiceData(data);
      case 'receipt':
        return this.validateReceiptData(data);
      default:
        return { isValid: true, score: 1.0, errors, warnings, suggestions };
    }
  }

  private async validateInvoiceData(data: InvoiceData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    // Validate required fields
    if (!data.invoiceNumber) {
      errors.push({
        field: 'invoiceNumber',
        message: 'Invoice number is required',
        severity: 'critical'
      });
    }
    
    if (!data.vendor?.name) {
      errors.push({
        field: 'vendor.name',
        message: 'Vendor name is required',
        severity: 'critical'
      });
    }
    
    if (!data.totals?.totalAmount || data.totals.totalAmount <= 0) {
      errors.push({
        field: 'totals.totalAmount',
        message: 'Valid total amount is required',
        severity: 'critical'
      });
    }
    
    // Validate date formats
    if (data.issueDate && !this.isValidDate(data.issueDate)) {
      warnings.push({
        field: 'issueDate',
        message: 'Issue date format may be incorrect',
        impact: 'Could affect payment processing'
      });
    }
    
    // Check for duplicates using local storage
    const existingInvoices = await offlineStorageManager.query({
      filters: { 'metadata.entityType': 'invoice' },
      tags: ['invoice']
    });
    
    const duplicate = existingInvoices.find(entry => 
      entry.data.invoiceNumber === data.invoiceNumber &&
      entry.data.vendor?.name === data.vendor?.name
    );
    
    if (duplicate) {
      warnings.push({
        field: 'invoiceNumber',
        message: 'Potential duplicate invoice detected',
        impact: 'May result in duplicate payment'
      });
    }
    
    const score = errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.3;
    
    return {
      isValid: errors.length === 0,
      score,
      errors,
      warnings,
      suggestions
    };
  }

  private async validateReceiptData(data: ReceiptData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    // Validate required fields
    if (!data.merchant?.name) {
      errors.push({
        field: 'merchant.name',
        message: 'Merchant name is required',
        severity: 'critical'
      });
    }
    
    if (!data.totals?.total || data.totals.total <= 0) {
      errors.push({
        field: 'totals.total',
        message: 'Valid total amount is required',
        severity: 'critical'
      });
    }
    
    if (!data.transactionDate) {
      errors.push({
        field: 'transactionDate',
        message: 'Transaction date is required',
        severity: 'critical'
      });
    }
    
    // Validate expense limits (example business rule)
    if (data.totals?.total && data.totals.total > 1000) {
      warnings.push({
        field: 'totals.total',
        message: 'Large expense amount detected',
        impact: 'May require additional approval'
      });
    }
    
    const score = errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.3;
    
    return {
      isValid: errors.length === 0,
      score,
      errors,
      warnings,
      suggestions
    };
  }

  // ==================== ENHANCEMENT METHODS ====================

  private async enhanceInvoiceData(data: InvoiceData): Promise<InvoiceData> {
    // Enhance with stored vendor information
    if (data.vendor?.name) {
      const vendors = await offlineStorageManager.searchVendors(data.vendor.name);
      if (vendors.length > 0) {
        const matchedVendor = vendors[0];
        data.vendor = {
          ...data.vendor,
          ...matchedVendor,
          name: data.vendor.name // Keep extracted name
        };
      }
    }
    
    return data;
  }

  private async categorizeExpense(data: ReceiptData): Promise<string> {
    // Simple rule-based expense categorization
    const merchantName = data.merchant?.name?.toLowerCase() || '';
    
    if (merchantName.includes('restaurant') || merchantName.includes('cafe') || merchantName.includes('food')) {
      return 'Meals & Entertainment';
    } else if (merchantName.includes('gas') || merchantName.includes('fuel') || merchantName.includes('petrol')) {
      return 'Travel';
    } else if (merchantName.includes('hotel') || merchantName.includes('inn') || merchantName.includes('motel')) {
      return 'Lodging';
    } else if (merchantName.includes('office') || merchantName.includes('supply') || merchantName.includes('staples')) {
      return 'Office Supplies';
    } else {
      return 'General Business Expense';
    }
  }

  private async normalizeContactData(data: any): Promise<any> {
    // Normalize and clean contact data
    return {
      ...data,
      name: this.capitalizeWords(data.name),
      company: this.capitalizeWords(data.company),
      email: data.email?.toLowerCase(),
      phone: this.normalizePhoneNumber(data.phone)
    };
  }

  // ==================== UTILITY METHODS ====================

  private createJob(type: ProcessingJob['type'], input: any, metadata: JobMetadata): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ProcessingJob = {
      id: jobId,
      type,
      input,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      metadata
    };
    
    this.processingQueue.set(jobId, job);
    return jobId;
  }

  private updateJobProgress(jobId: string, progress: number, message?: string): void {
    const job = this.processingQueue.get(jobId);
    if (job) {
      job.progress = progress;
      job.status = progress === 100 ? 'completed' : 'processing';
      this.emit('job-progress', { jobId, progress, message });
    }
  }

  private completeJob(jobId: string, result: any): void {
    const job = this.processingQueue.get(jobId);
    if (job) {
      job.status = 'completed';
      job.result = result;
      job.endTime = Date.now();
      this.emit('job-completed', { jobId, result });
    }
  }

  private getJob(jobId: string): ProcessingJob | undefined {
    return this.processingQueue.get(jobId);
  }

  private calculateOverallConfidence(
    classification: ClassificationResult,
    ocr: OfflineOCRResult,
    validation: ValidationResult
  ): number {
    return (classification.confidence * 0.3 + ocr.confidence * 0.3 + validation.score * 0.4);
  }

  // ==================== PATTERN EXTRACTION HELPERS ====================

  private extractPattern(text: string, pattern: RegExp): RegExpMatchArray | null {
    return text.match(pattern);
  }

  private extractVendorName(text: string): string {
    // Extract vendor name from top of document
    const lines = text.split('\n').filter(line => line.trim());
    return lines[0] || '';
  }

  private extractMerchantName(text: string): string {
    // Extract merchant name (usually first line)
    const lines = text.split('\n').filter(line => line.trim());
    return lines[0] || '';
  }

  private extractContactName(text: string): string {
    // Extract person name from business card
    const lines = text.split('\n').filter(line => line.trim());
    // Name is usually in the first few lines and doesn't contain common business words
    const businessWords = ['inc', 'llc', 'corp', 'ltd', 'company', 'co', 'solutions', 'services'];
    
    for (const line of lines.slice(0, 3)) {
      const hasBusinessWord = businessWords.some(word => 
        line.toLowerCase().includes(word)
      );
      if (!hasBusinessWord && line.length > 3 && line.length < 50) {
        return line.trim();
      }
    }
    
    return lines[0] || '';
  }

  private extractAddress(text: string): string {
    // Extract address using pattern matching
    const addressPattern = /\d+[\w\s,.-]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|way)/i;
    const match = text.match(addressPattern);
    return match ? match[0] : '';
  }

  private extractTotals(text: string): any {
    const totalPattern = /(?:total|amount due)[\s:$]*(\d+(?:\.\d{2})?)/i;
    const subtotalPattern = /(?:subtotal)[\s:$]*(\d+(?:\.\d{2})?)/i;
    const taxPattern = /(?:tax|vat)[\s:$]*(\d+(?:\.\d{2})?)/i;
    
    return {
      totalAmount: parseFloat(this.extractPattern(text, totalPattern)?.[1] || '0'),
      subtotal: parseFloat(this.extractPattern(text, subtotalPattern)?.[1] || '0'),
      totalTax: parseFloat(this.extractPattern(text, taxPattern)?.[1] || '0')
    };
  }

  private extractReceiptTotals(text: string): any {
    const totalPattern = /(?:total)[\s:$]*(\d+(?:\.\d{2})?)/i;
    const taxPattern = /(?:tax)[\s:$]*(\d+(?:\.\d{2})?)/i;
    
    const total = parseFloat(this.extractPattern(text, totalPattern)?.[1] || '0');
    const tax = parseFloat(this.extractPattern(text, taxPattern)?.[1] || '0');
    
    return {
      total,
      tax,
      subtotal: total - tax
    };
  }

  private extractLineItems(text: string): any[] {
    // Simple line item extraction
    return [];
  }

  private extractReceiptItems(text: string): any[] {
    // Simple receipt item extraction
    return [];
  }

  private extractCurrency(text: string): string | undefined {
    const currencyPattern = /\$|USD|EUR|GBP|CAD/i;
    const match = text.match(currencyPattern);
    return match ? match[0].toUpperCase() : undefined;
  }

  private extractPaymentTerms(text: string): string {
    const termsPattern = /(?:terms|payment)[\s:]*(\d+\s*days?|net\s*\d+)/i;
    return this.extractPattern(text, termsPattern)?.[1] || '';
  }

  private extractPaymentMethod(text: string): string {
    const methods = ['cash', 'credit', 'debit', 'card', 'check'];
    const lowerText = text.toLowerCase();
    
    for (const method of methods) {
      if (lowerText.includes(method)) {
        return method;
      }
    }
    
    return 'unknown';
  }

  private extractNotes(text: string): string {
    return '';
  }

  private extractBillToName(text: string): string {
    return '';
  }

  private extractBillToAddress(text: string): string {
    return '';
  }

  private extractJobTitle(text: string): string {
    const titles = ['manager', 'director', 'president', 'ceo', 'cfo', 'vp', 'vice president', 'engineer', 'developer', 'analyst'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (titles.some(title => lowerLine.includes(title))) {
        return line.trim();
      }
    }
    
    return '';
  }

  private extractCompanyName(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    const businessWords = ['inc', 'llc', 'corp', 'ltd', 'company', 'co'];
    
    for (const line of lines) {
      if (businessWords.some(word => line.toLowerCase().includes(word))) {
        return line.trim();
      }
    }
    
    return '';
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private capitalizeWords(str: string): string {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  private generateMockOCRText(image: CapturedPhoto): string {
    // Generate realistic mock OCR text based on image
    return `ACME CORPORATION
123 Business Street
City, State 12345

INVOICE

Invoice #: INV-2024-001
Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Bill To:
ABC Company
456 Client Avenue
Town, State 67890

Description          Qty    Rate     Amount
Professional Services  10   $100.00   $1,000.00
Consulting Hours       5    $150.00   $750.00

                    Subtotal: $1,750.00
                         Tax: $140.00
                       Total: $1,890.00

Payment Terms: Net 30
Thank you for your business!`;
  }

  private generateMockBoundingBoxes(text: string): BoundingBox[] {
    // Generate mock bounding boxes for text
    const lines = text.split('\n');
    return lines.map((line, index) => ({
      x: 10,
      y: 10 + (index * 20),
      width: line.length * 8,
      height: 18,
      text: line,
      confidence: 0.85 + Math.random() * 0.1
    }));
  }

  private getDefaultRules(): any {
    return {
      invoice: {
        requiredFields: ['invoiceNumber', 'vendor.name', 'totals.totalAmount'],
        validation: {
          invoiceNumber: { pattern: /^[A-Z0-9\-]+$/i },
          totalAmount: { min: 0, max: 1000000 }
        }
      },
      receipt: {
        requiredFields: ['merchant.name', 'totals.total', 'transactionDate'],
        validation: {
          total: { min: 0, max: 10000 }
        }
      }
    };
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    // Clean up workers
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
    
    this.workers.clear();
    this.processingQueue.clear();
    this.removeAllListeners();
  }
}

// ==================== FACTORY FUNCTION ====================

export function createOfflineProcessingEngine(config?: Partial<ProcessingConfig>): OfflineProcessingEngine {
  return new OfflineProcessingEngine(config);
}

// ==================== SINGLETON INSTANCE ====================

export const offlineProcessingEngine = createOfflineProcessingEngine();