/**
 * HERA Universal ERP - OpenAI Integration Service
 * Advanced AI integration with GPT-4V, GPT-4, and specialized document processing
 */

import { CapturedPhoto } from '@/lib/camera/universal-camera-service';
import { OCRResult } from './ocr-service';

// ==================== TYPES ====================

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
  model: {
    vision: string;
    text: string;
    embedding: string;
  };
}

export interface DocumentAnalysisRequest {
  image?: CapturedPhoto;
  text?: string;
  ocrResult?: OCRResult;
  documentType?: string;
  analysisType: 'classification' | 'extraction' | 'validation' | 'insights';
  context?: Record<string, any>;
}

export interface DocumentAnalysisResponse {
  result: any;
  confidence: number;
  reasoning: string;
  alternatives?: Array<{
    result: any;
    confidence: number;
    reasoning: string;
  }>;
  processingTime: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ClassificationResult {
  documentType: string;
  confidence: number;
  subType?: string;
  characteristics: string[];
  reasoning: string;
}

export interface ExtractionResult {
  structuredData: Record<string, any>;
  confidence: number;
  fieldsExtracted: string[];
  fieldsWithLowConfidence: string[];
  reasoning: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
  reasoning: string;
}

export interface ValidationIssue {
  field: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedFix?: string;
}

export interface InsightsResult {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  anomalies: string[];
  confidence: number;
  businessImpact: 'low' | 'medium' | 'high';
}

// ==================== OPENAI INTEGRATION SERVICE ====================

export class OpenAIIntegrationService {
  private config: OpenAIConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: OpenAIConfig) {
    this.config = {
      baseURL: 'https://api.openai.com/v1',
      timeout: 30000,
      maxRetries: 3,
      model: {
        vision: 'gpt-4-vision-preview',
        text: 'gpt-4-turbo-preview',
        embedding: 'text-embedding-3-large'
      },
      ...config
    };
  }

  // ==================== DOCUMENT CLASSIFICATION ====================

  async classifyDocument(request: DocumentAnalysisRequest): Promise<ClassificationResult> {
    try {
      console.log('🤖 HERA: Classifying document with OpenAI...');
      const startTime = performance.now();

      const prompt = this.buildClassificationPrompt(request);
      const response = await this.callOpenAI(prompt, request.image);
      
      const result = this.parseClassificationResponse(response);
      const processingTime = performance.now() - startTime;

      console.log(`✅ HERA: Document classified as ${result.documentType} (${processingTime.toFixed(2)}ms)`);
      
      return result;

    } catch (error) {
      console.error('❌ HERA: Document classification failed:', error);
      throw new Error(`Classification failed: ${error}`);
    }
  }

  // ==================== DATA EXTRACTION ====================

  async extractInvoiceData(request: DocumentAnalysisRequest): Promise<ExtractionResult> {
    try {
      console.log('📄 HERA: Extracting invoice data with OpenAI...');
      
      const prompt = this.buildInvoiceExtractionPrompt(request);
      const response = await this.callOpenAI(prompt, request.image);
      
      const result = this.parseExtractionResponse(response, 'invoice');
      
      console.log('✅ HERA: Invoice data extraction completed');
      return result;

    } catch (error) {
      console.error('❌ HERA: Invoice extraction failed:', error);
      throw new Error(`Invoice extraction failed: ${error}`);
    }
  }

  async extractReceiptData(request: DocumentAnalysisRequest): Promise<ExtractionResult> {
    try {
      console.log('🧾 HERA: Extracting receipt data with OpenAI...');
      
      const prompt = this.buildReceiptExtractionPrompt(request);
      const response = await this.callOpenAI(prompt, request.image);
      
      const result = this.parseExtractionResponse(response, 'receipt');
      
      console.log('✅ HERA: Receipt data extraction completed');
      return result;

    } catch (error) {
      console.error('❌ HERA: Receipt extraction failed:', error);
      throw new Error(`Receipt extraction failed: ${error}`);
    }
  }

  async extractBusinessCardData(request: DocumentAnalysisRequest): Promise<ExtractionResult> {
    try {
      console.log('👤 HERA: Extracting business card data with OpenAI...');
      
      const prompt = this.buildBusinessCardExtractionPrompt(request);
      const response = await this.callOpenAI(prompt, request.image);
      
      const result = this.parseExtractionResponse(response, 'business_card');
      
      console.log('✅ HERA: Business card data extraction completed');
      return result;

    } catch (error) {
      console.error('❌ HERA: Business card extraction failed:', error);
      throw new Error(`Business card extraction failed: ${error}`);
    }
  }

  // ==================== DATA VALIDATION ====================

  async validateExtractedData(data: any, documentType: string): Promise<ValidationResult> {
    try {
      console.log('✅ HERA: Validating extracted data with OpenAI...');
      
      const prompt = this.buildValidationPrompt(data, documentType);
      const response = await this.callOpenAI(prompt);
      
      const result = this.parseValidationResponse(response);
      
      console.log('✅ HERA: Data validation completed');
      return result;

    } catch (error) {
      console.error('❌ HERA: Data validation failed:', error);
      throw new Error(`Validation failed: ${error}`);
    }
  }

  // ==================== SCHEMA GENERATION ====================

  async generateSchema(requirement: string, entityType?: string): Promise<any> {
    try {
      console.log('🤖 HERA: Generating schema with OpenAI GPT-4...');
      const startTime = performance.now();

      const prompt = this.buildSchemaGenerationPrompt(requirement, entityType);
      const response = await this.callOpenAI(prompt);
      
      const schema = this.parseSchemaResponse(response);
      const processingTime = performance.now() - startTime;

      console.log(`✅ HERA: OpenAI schema generation completed (${processingTime.toFixed(2)}ms)`);
      
      return schema;

    } catch (error) {
      console.error('❌ HERA: OpenAI schema generation failed:', error);
      throw new Error(`OpenAI schema generation failed: ${error}`);
    }
  }

  // ==================== AI INSIGHTS ====================

  async generateInsights(data: any, documentType: string, context?: Record<string, any>): Promise<InsightsResult> {
    try {
      console.log('🧠 HERA: Generating AI insights with OpenAI...');
      
      const prompt = this.buildInsightsPrompt(data, documentType, context);
      const response = await this.callOpenAI(prompt);
      
      const result = this.parseInsightsResponse(response);
      
      console.log('✅ HERA: AI insights generation completed');
      return result;

    } catch (error) {
      console.error('❌ HERA: Insights generation failed:', error);
      throw new Error(`Insights generation failed: ${error}`);
    }
  }

  // ==================== SPECIALIZED PROMPTS ====================

  private buildSchemaGenerationPrompt(requirement: string, entityType?: string): string {
    return `
You are an expert business analyst and database architect. Your task is to analyze a business requirement and generate a comprehensive database schema with form fields.

Business Requirement: "${requirement}"
${entityType ? `Entity Type: ${entityType}` : ''}

Please analyze this requirement and generate a JSON response with the following structure:

{
  "entityType": "suggested_entity_type",
  "entityName": "Human Readable Name",
  "domain": {
    "name": "business_domain",
    "confidence": 0.95,
    "keywords": ["relevant", "keywords"],
    "commonFields": []
  },
  "fields": [
    {
      "name": "field_name",
      "type": "field_type",
      "required": true,
      "label": "Field Label",
      "placeholder": "Enter value...",
      "validation": {},
      "source": "ai",
      "confidence": 0.9,
      "aiGenerated": true
    }
  ],
  "metadata": {
    "generated_at": "${new Date().toISOString()}",
    "generator_version": "1.0.0",
    "requirement_analysis": {
      "domain": "identified_domain",
      "confidence": 0.95,
      "complexity": 0.7
    },
    "business_context": {
      "domain": "domain_name",
      "industry": "industry_type",
      "use_case": "primary_use_case"
    },
    "ai_insights": [
      {
        "type": "compliance",
        "title": "Compliance Consideration",
        "description": "Description of compliance needs",
        "priority": "high",
        "recommendation": "Specific recommendation"
      }
    ]
  },
  "confidence": 0.92,
  "suggestions": [
    "Consider adding audit trail fields",
    "Add data validation rules"
  ],
  "validationRules": {
    "field_name": {
      "required": true,
      "minLength": 1
    }
  },
  "businessRules": [
    "Business rule 1",
    "Business rule 2"
  ],
  "auditTrail": {
    "generated_at": "${new Date().toISOString()}",
    "requirement": "${requirement}",
    "analysis": {
      "originalText": "${requirement}",
      "entityType": "identified_entity_type",
      "complexity": 0.7
    }
  }
}

Field types available: text, number, email, phone, url, date, datetime, currency, boolean, select, multiselect, textarea, file, percentage, json

Analysis Guidelines:
1. Identify the core business domain (finance, crm, inventory, hr, project, restaurant, retail, etc.)
2. Extract key entities and relationships from the requirement
3. Generate appropriate field names, types, and validation rules
4. Provide business insights and compliance considerations
5. Suggest optimizations and best practices
6. Ensure the schema is practical and implementable

Focus on creating a schema that directly addresses the business requirement while following database design best practices.
`;
  }

  private buildClassificationPrompt(request: DocumentAnalysisRequest): string {
    const basePrompt = `
You are an expert document classifier specializing in business documents. Analyze the provided document and classify it.

Classification Categories:
- invoice: Vendor invoices, bills, statements
- receipt: Purchase receipts, expense receipts
- business_card: Contact cards, business cards
- purchase_order: Purchase orders, requisitions
- contract: Agreements, contracts, terms
- financial_statement: Balance sheets, P&L, cash flow
- tax_document: Tax forms, returns, assessments
- legal_document: Legal papers, filings, notices
- identification: ID cards, licenses, certificates
- other: Documents that don't fit standard categories

Instructions:
1. Carefully examine the document layout, text content, and visual elements
2. Identify key characteristics that indicate document type
3. Consider the presence of specific fields, logos, formats
4. Provide your classification with confidence level (0.0-1.0)
5. Explain your reasoning in detail

${request.text ? `\nExtracted Text:\n${request.text}` : ''}
${request.ocrResult ? `\nOCR Confidence: ${request.ocrResult.confidence}%` : ''}

Return your response in JSON format:
{
  "documentType": "classification",
  "confidence": 0.95,
  "subType": "vendor_invoice",
  "characteristics": ["has_invoice_number", "has_vendor_info", "has_line_items"],
  "reasoning": "Detailed explanation of classification decision"
}`;

    return basePrompt;
  }

  private buildInvoiceExtractionPrompt(request: DocumentAnalysisRequest): string {
    const basePrompt = `
You are an expert at extracting structured data from invoices. Extract all relevant information from this invoice.

Required Fields:
- invoiceNumber: The invoice number/reference
- issueDate: Invoice issue date
- dueDate: Payment due date
- vendor: Complete vendor information
- billTo: Billing address information
- lineItems: All products/services with quantities and prices
- totals: Subtotal, tax, total amounts
- paymentTerms: Payment terms and conditions

Instructions:
1. Extract all text content carefully
2. Identify and structure all invoice fields
3. Calculate totals if missing
4. Maintain data relationships and hierarchy
5. Handle multiple currencies if present
6. Extract tax information separately

${request.text ? `\nExtracted Text:\n${request.text}` : ''}

Return response in JSON format with complete invoice structure:
{
  "invoiceNumber": "INV-2024-001",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "vendor": {
    "name": "Vendor Name",
    "address": {...},
    "taxId": "123456789",
    "contactInfo": {...}
  },
  "billTo": {...},
  "lineItems": [
    {
      "description": "Product/Service",
      "quantity": 1,
      "unitPrice": 100.00,
      "totalPrice": 100.00,
      "taxRate": 0.1
    }
  ],
  "totals": {
    "subtotal": 100.00,
    "totalTax": 10.00,
    "totalAmount": 110.00
  },
  "currency": "USD",
  "paymentTerms": "Net 30"
}`;

    return basePrompt;
  }

  private buildReceiptExtractionPrompt(request: DocumentAnalysisRequest): string {
    const basePrompt = `
You are an expert at extracting data from receipts for expense management. Extract all relevant information.

Required Fields:
- merchant: Store/restaurant/vendor information
- transactionDate: Date of purchase
- transactionTime: Time of purchase (if available)
- items: List of purchased items
- totals: Amounts including tax, tip, total
- paymentMethod: How payment was made
- category: Type of expense (meals, office supplies, travel, etc.)

Instructions:
1. Identify merchant name and location
2. Extract all purchased items with quantities and prices
3. Calculate or extract tax amounts
4. Identify payment method used
5. Categorize the type of expense
6. Extract receipt number if available

${request.text ? `\nExtracted Text:\n${request.text}` : ''}

Return response in JSON format:
{
  "receiptNumber": "RCP-123456",
  "transactionDate": "2024-01-15",
  "transactionTime": "14:30",
  "merchant": {
    "name": "Merchant Name",
    "address": {...},
    "category": "restaurant"
  },
  "items": [
    {
      "description": "Item name",
      "quantity": 1,
      "unitPrice": 10.00,
      "totalPrice": 10.00
    }
  ],
  "totals": {
    "subtotal": 50.00,
    "tax": 5.00,
    "tip": 8.00,
    "total": 63.00
  },
  "paymentMethod": {
    "type": "credit",
    "lastFourDigits": "1234"
  },
  "category": "meals",
  "expenseType": "business_meal"
}`;

    return basePrompt;
  }

  private buildBusinessCardExtractionPrompt(request: DocumentAnalysisRequest): string {
    const basePrompt = `
You are an expert at extracting contact information from business cards. Extract all available contact details.

Required Fields:
- name: Full name of the person
- title: Job title or position
- company: Company/organization name
- contactInfo: Phone, email, website
- address: Business address
- socialMedia: LinkedIn, Twitter, etc. (if present)

Instructions:
1. Identify the person's full name and title
2. Extract company name and industry if identifiable
3. Find all contact methods (phone, email, website)
4. Extract complete address information
5. Identify any social media handles
6. Note any additional information (certifications, specialties)

${request.text ? `\nExtracted Text:\n${request.text}` : ''}

Return response in JSON format:
{
  "name": "John Smith",
  "title": "Senior Sales Manager",
  "company": "TechCorp Solutions",
  "contactInfo": {
    "phone": "+1-555-123-4567",
    "mobile": "+1-555-987-6543",
    "email": "john.smith@techcorp.com",
    "website": "www.techcorp.com"
  },
  "address": {
    "street1": "123 Business Ave",
    "city": "Tech City",
    "state": "CA",
    "postalCode": "90210",
    "country": "USA"
  },
  "industry": "Technology",
  "department": "Sales",
  "socialMedia": {
    "linkedin": "linkedin.com/in/johnsmith"
  }
}`;

    return basePrompt;
  }

  private buildValidationPrompt(data: any, documentType: string): string {
    return `
You are a data validation expert. Validate the extracted ${documentType} data for accuracy, completeness, and business logic.

Validation Criteria:
1. Required fields are present and properly formatted
2. Numerical calculations are correct
3. Dates are valid and logical
4. Business logic is sound (e.g., due date after issue date)
5. Data consistency across fields
6. Format compliance (phone numbers, emails, addresses)

Extracted Data:
${JSON.stringify(data, null, 2)}

Instructions:
1. Check each field for validity and format
2. Verify calculations and totals
3. Identify any missing critical information
4. Flag potential errors or inconsistencies
5. Suggest corrections for issues found
6. Assess overall data quality

Return response in JSON format:
{
  "isValid": true,
  "confidence": 0.95,
  "issues": [
    {
      "field": "dueDate",
      "severity": "medium",
      "description": "Due date appears to be before issue date",
      "suggestedFix": "Verify date format or contact vendor"
    }
  ],
  "suggestions": [
    "Consider adding vendor tax ID for compliance",
    "Verify line item calculations"
  ],
  "reasoning": "Overall data appears valid with minor formatting issues"
}`;
  }

  private buildInsightsPrompt(data: any, documentType: string, context?: Record<string, any>): string {
    return `
You are a business intelligence expert. Analyze this ${documentType} data and provide actionable insights.

Analysis Areas:
1. Financial patterns and trends
2. Vendor/supplier relationships
3. Expense categorization and optimization
4. Compliance and risk factors
5. Process improvement opportunities
6. Anomaly detection

Document Data:
${JSON.stringify(data, null, 2)}

${context ? `\nAdditional Context:\n${JSON.stringify(context, null, 2)}` : ''}

Instructions:
1. Identify key financial and operational insights
2. Compare against industry standards if applicable
3. Flag any unusual patterns or anomalies
4. Provide actionable recommendations
5. Assess business impact and risk levels
6. Suggest process improvements

Return response in JSON format:
{
  "summary": "Brief overview of key findings",
  "keyInsights": [
    "Insight 1: Detailed observation",
    "Insight 2: Pattern analysis"
  ],
  "recommendations": [
    "Recommendation 1: Specific action",
    "Recommendation 2: Process improvement"
  ],
  "anomalies": [
    "Anomaly 1: Unusual pattern detected"
  ],
  "confidence": 0.90,
  "businessImpact": "medium"
}`;
  }

  // ==================== API CALLS ====================

  private async callOpenAI(prompt: string, image?: CapturedPhoto): Promise<DocumentAnalysisResponse> {
    try {
      const messages = [];

      if (image) {
        // Use GPT-4V for image analysis
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: image.dataUrl,
                detail: 'high'
              }
            }
          ]
        });
      } else {
        // Use GPT-4 for text-only analysis
        messages.push({
          role: 'user',
          content: prompt
        });
      }

      const startTime = performance.now();

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
        },
        body: JSON.stringify({
          model: image ? this.config.model.vision : this.config.model.text,
          messages,
          max_tokens: 4000,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = performance.now() - startTime;

      return {
        result: JSON.parse(data.choices[0].message.content),
        confidence: 0.9, // Will be parsed from response
        reasoning: 'AI analysis completed',
        processingTime,
        tokenUsage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };

    } catch (error) {
      console.error('❌ HERA: OpenAI API call failed:', error);
      throw error;
    }
  }

  // ==================== RESPONSE PARSERS ====================

  private parseClassificationResponse(response: DocumentAnalysisResponse): ClassificationResult {
    const result = response.result;
    return {
      documentType: result.documentType || 'unknown',
      confidence: result.confidence || 0.5,
      subType: result.subType,
      characteristics: result.characteristics || [],
      reasoning: result.reasoning || 'Classification completed'
    };
  }

  private parseExtractionResponse(response: DocumentAnalysisResponse, documentType: string): ExtractionResult {
    const result = response.result;
    const fieldsExtracted = Object.keys(result);
    
    return {
      structuredData: result,
      confidence: response.confidence,
      fieldsExtracted,
      fieldsWithLowConfidence: [],
      reasoning: response.reasoning
    };
  }

  private parseValidationResponse(response: DocumentAnalysisResponse): ValidationResult {
    const result = response.result;
    return {
      isValid: result.isValid || false,
      confidence: result.confidence || 0.5,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      reasoning: result.reasoning || 'Validation completed'
    };
  }

  private parseSchemaResponse(response: DocumentAnalysisResponse): any {
    if (response.result) {
      return response.result;
    }

    // Return minimal schema if parsing fails
    return {
      entityType: 'custom_entity',
      name: 'Custom Entity',
      domain: { name: 'general', confidence: 0.5 },
      fields: [],
      confidence: 0.5,
      suggestions: [],
      validationRules: {},
      businessRules: [],
      auditTrail: {
        generated_at: new Date().toISOString(),
        requirement: '',
        analysis: { originalText: '', entityType: 'custom_entity', complexity: 0.5 }
      }
    };
  }

  private parseInsightsResponse(response: DocumentAnalysisResponse): InsightsResult {
    const result = response.result;
    return {
      summary: result.summary || 'No summary available',
      keyInsights: result.keyInsights || [],
      recommendations: result.recommendations || [],
      anomalies: result.anomalies || [],
      confidence: result.confidence || 0.5,
      businessImpact: result.businessImpact || 'low'
    };
  }

  // ==================== UTILITY METHODS ====================

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model.embedding,
          input: text
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      console.error('❌ HERA: Embedding generation failed:', error);
      throw error;
    }
  }

  async analyzeDocumentSimilarity(doc1: any, doc2: any): Promise<number> {
    try {
      const text1 = JSON.stringify(doc1);
      const text2 = JSON.stringify(doc2);

      const [embedding1, embedding2] = await Promise.all([
        this.generateEmbedding(text1),
        this.generateEmbedding(text2)
      ]);

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(embedding1, embedding2);
      return similarity;

    } catch (error) {
      console.error('❌ HERA: Similarity analysis failed:', error);
      return 0;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // ==================== CONFIGURATION ====================

  updateConfig(config: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getUsageStats(): any {
    // Return API usage statistics
    return {
      totalRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0
    };
  }
}

// ==================== FACTORY FUNCTION ====================

export function createOpenAIIntegration(config: OpenAIConfig): OpenAIIntegrationService {
  return new OpenAIIntegrationService(config);
}

// ==================== SINGLETON INSTANCE ====================

export const openAIIntegration = createOpenAIIntegration({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: process.env.OPENAI_ORG_ID || undefined,
  model: {
    vision: 'gpt-4-vision-preview',
    text: 'gpt-4-turbo-preview',
    embedding: 'text-embedding-3-large'
  }
});

export default openAIIntegration;