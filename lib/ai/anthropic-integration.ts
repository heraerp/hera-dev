/**
 * HERA Universal ERP - Anthropic Claude Integration Service
 * Advanced AI integration with Claude 3 for document analysis and business intelligence
 */

import { CapturedPhoto } from '@/lib/camera/universal-camera-service';
import { OCRResult } from './ocr-service';

// ==================== TYPES ====================

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  model: {
    vision: string;
    text: string;
  };
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeRequest {
  image?: CapturedPhoto;
  text?: string;
  ocrResult?: OCRResult;
  task: 'analyze' | 'extract' | 'validate' | 'reason' | 'summarize';
  context?: Record<string, any>;
  instructions?: string;
}

export interface ClaudeResponse {
  content: string;
  structuredResult?: any;
  confidence: number;
  reasoning: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTime: number;
}

export interface DocumentAnalysis {
  documentType: string;
  confidence: number;
  keyFeatures: string[];
  businessContext: string;
  recommendations: string[];
  structuredData?: any;
}

export interface ValidationAnalysis {
  isValid: boolean;
  confidence: number;
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  businessLogicCheck: boolean;
  complianceCheck: boolean;
}

export interface BusinessInsights {
  executiveSummary: string;
  keyFindings: string[];
  riskFactors: string[];
  opportunities: string[];
  actionItems: string[];
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
}

// ==================== ANTHROPIC INTEGRATION SERVICE ====================

export class AnthropicIntegrationService {
  private config: AnthropicConfig;
  private requestHistory: ClaudeRequest[] = [];

  constructor(config: AnthropicConfig) {
    this.config = {
      baseURL: 'https://api.anthropic.com/v1',
      timeout: 60000,
      maxRetries: 3,
      maxTokens: 4000,
      temperature: 0.1,
      model: {
        vision: 'claude-3-opus-20240229',
        text: 'claude-3-sonnet-20240229'
      },
      ...config
    };
  }

  // ==================== DOCUMENT ANALYSIS ====================

  async analyzeDocument(request: ClaudeRequest): Promise<DocumentAnalysis> {
    try {
      console.log('🧠 HERA: Analyzing document with Claude...');
      const startTime = performance.now();

      const prompt = this.buildDocumentAnalysisPrompt(request);
      const response = await this.callClaude(prompt, request.image);
      
      const analysis = this.parseDocumentAnalysis(response);
      const processingTime = performance.now() - startTime;

      console.log(`✅ HERA: Document analysis completed (${processingTime.toFixed(2)}ms)`);
      
      return analysis;

    } catch (error) {
      console.error('❌ HERA: Document analysis failed:', error);
      throw new Error(`Claude analysis failed: ${error}`);
    }
  }

  // ==================== INTELLIGENT EXTRACTION ====================

  async intelligentExtraction(request: ClaudeRequest): Promise<any> {
    try {
      console.log('🔍 HERA: Performing intelligent extraction with Claude...');
      
      const prompt = this.buildExtractionPrompt(request);
      const response = await this.callClaude(prompt, request.image);
      
      const extractedData = this.parseExtractionResult(response);
      
      console.log('✅ HERA: Intelligent extraction completed');
      return extractedData;

    } catch (error) {
      console.error('❌ HERA: Intelligent extraction failed:', error);
      throw new Error(`Claude extraction failed: ${error}`);
    }
  }

  // ==================== ADVANCED VALIDATION ====================

  async performAdvancedValidation(data: any, context: Record<string, any>): Promise<ValidationAnalysis> {
    try {
      console.log('✅ HERA: Performing advanced validation with Claude...');
      
      const prompt = this.buildValidationPrompt(data, context);
      const response = await this.callClaude(prompt);
      
      const validation = this.parseValidationResult(response);
      
      console.log('✅ HERA: Advanced validation completed');
      return validation;

    } catch (error) {
      console.error('❌ HERA: Advanced validation failed:', error);
      throw new Error(`Claude validation failed: ${error}`);
    }
  }

  // ==================== BUSINESS INTELLIGENCE ====================

  async generateBusinessInsights(data: any, context?: Record<string, any>): Promise<BusinessInsights> {
    try {
      console.log('📊 HERA: Generating business insights with Claude...');
      
      const prompt = this.buildBusinessInsightsPrompt(data, context);
      const response = await this.callClaude(prompt);
      
      const insights = this.parseBusinessInsights(response);
      
      console.log('✅ HERA: Business insights generation completed');
      return insights;

    } catch (error) {
      console.error('❌ HERA: Business insights generation failed:', error);
      throw new Error(`Claude insights failed: ${error}`);
    }
  }

  // ==================== SCHEMA GENERATION ====================

  async generateSchema(requirement: string, entityType?: string): Promise<any> {
    try {
      console.log('🧠 HERA: Generating schema with Claude...');
      const startTime = performance.now();

      const prompt = this.buildSchemaGenerationPrompt(requirement, entityType);
      const response = await this.callClaude(prompt);
      
      const schema = this.parseSchemaResponse(response);
      const processingTime = performance.now() - startTime;

      console.log(`✅ HERA: Claude schema generation completed (${processingTime.toFixed(2)}ms)`);
      
      return schema;

    } catch (error) {
      console.error('❌ HERA: Claude schema generation failed:', error);
      throw new Error(`Claude schema generation failed: ${error}`);
    }
  }

  // ==================== REASONING AND EXPLANATION ====================

  async explainProcessing(data: any, decisions: any[]): Promise<string> {
    try {
      console.log('💭 HERA: Generating processing explanation with Claude...');
      
      const prompt = this.buildExplanationPrompt(data, decisions);
      const response = await this.callClaude(prompt);
      
      console.log('✅ HERA: Processing explanation completed');
      return response.content;

    } catch (error) {
      console.error('❌ HERA: Processing explanation failed:', error);
      throw new Error(`Claude explanation failed: ${error}`);
    }
  }

  async suggestOptimizations(processData: any, performanceMetrics: any): Promise<string[]> {
    try {
      console.log('⚡ HERA: Generating optimization suggestions with Claude...');
      
      const prompt = this.buildOptimizationPrompt(processData, performanceMetrics);
      const response = await this.callClaude(prompt);
      
      const suggestions = this.parseOptimizationSuggestions(response);
      
      console.log('✅ HERA: Optimization suggestions completed');
      return suggestions;

    } catch (error) {
      console.error('❌ HERA: Optimization suggestions failed:', error);
      return [];
    }
  }

  // ==================== PROMPT BUILDERS ====================

  private buildSchemaGenerationPrompt(requirement: string, entityType?: string): string {
    return `
You are Claude, an expert business analyst and database architect specializing in enterprise schema design. Your task is to analyze a business requirement and generate a comprehensive, production-ready database schema with form fields.

Business Requirement: "${requirement}"
${entityType ? `Entity Type: ${entityType}` : ''}

Please analyze this requirement with deep business understanding and generate a JSON response with the following structure:

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
      "aiGenerated": true,
      "description": "Field purpose and usage"
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

Claude's Analysis Framework:
1. Business Domain Analysis: Identify the core business domain (finance, crm, inventory, hr, project, restaurant, retail, etc.)
2. Entity Relationship Mapping: Extract key entities and their relationships from the requirement
3. Field Intelligence: Generate appropriate field names, types, and validation rules based on business context
4. Compliance Assessment: Provide business insights and compliance considerations specific to the domain
5. Optimization Recommendations: Suggest optimizations and best practices for enterprise use
6. Implementation Readiness: Ensure the schema is practical, scalable, and immediately implementable

Focus Areas:
- Deep understanding of business processes and workflows
- Enterprise-grade validation and business rules
- Industry-specific compliance requirements
- Scalable field design for future extensibility
- User experience optimization for form interactions
- Data integrity and security considerations

Please provide a thoughtful, comprehensive schema that directly addresses the business requirement while following enterprise database design best practices and industry standards.
`;
  }

  private buildDocumentAnalysisPrompt(request: ClaudeRequest): string {
    return `
You are Claude, an expert AI assistant specializing in business document analysis. You have exceptional abilities in understanding document structure, extracting meaningful information, and providing business context.

Task: Analyze this business document and provide comprehensive insights.

Analysis Requirements:
1. Document Type Classification
   - Identify the specific type of business document
   - Assess confidence in classification
   - Note any unique characteristics

2. Key Feature Identification
   - Extract primary business entities (companies, people, amounts)
   - Identify critical dates and deadlines
   - Note important business terms and conditions

3. Business Context Analysis
   - Understand the business transaction or relationship
   - Identify potential compliance requirements
   - Assess business impact and urgency

4. Recommendations
   - Suggest next steps for processing
   - Identify potential issues or concerns
   - Recommend validation checkpoints

${request.text ? `\nExtracted Text Content:\n${request.text}` : ''}
${request.ocrResult ? `\nOCR Analysis Results:\nConfidence: ${request.ocrResult.confidence}%\nLanguage: ${request.ocrResult.metadata.languagesDetected.join(', ')}\nProcessing Time: ${request.ocrResult.metadata.processingTime}ms` : ''}
${request.context ? `\nBusiness Context:\n${JSON.stringify(request.context, null, 2)}` : ''}

Please provide your analysis in a structured format, being thorough and precise in your assessment. Focus on business relevance and actionable insights.

Return your response in JSON format:
{
  "documentType": "specific_document_type",
  "confidence": 0.95,
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "businessContext": "detailed_business_context_explanation",
  "recommendations": ["recommendation1", "recommendation2"],
  "structuredData": {
    "extracted_business_entities": "organized_data"
  }
}`;
  }

  private buildExtractionPrompt(request: ClaudeRequest): string {
    return `
You are Claude, an expert at extracting and structuring information from business documents. Your task is to perform intelligent extraction that goes beyond simple OCR to understand business meaning and relationships.

Extraction Task: Extract all relevant business information from this document with deep understanding of business context.

Extraction Principles:
1. Business Entity Recognition
   - Companies, vendors, customers
   - People and their roles
   - Products and services
   - Financial amounts and currencies

2. Relationship Mapping
   - How entities relate to each other
   - Transaction flows and dependencies
   - Temporal relationships and sequences

3. Business Logic Understanding
   - Terms and conditions
   - Payment terms and deadlines
   - Compliance requirements
   - Business rules and constraints

4. Data Validation
   - Cross-reference extracted data for consistency
   - Identify potential errors or missing information
   - Flag unusual patterns or anomalies

${request.text ? `\nDocument Content:\n${request.text}` : ''}
${request.context ? `\nBusiness Context:\n${JSON.stringify(request.context, null, 2)}` : ''}
${request.instructions ? `\nSpecial Instructions:\n${request.instructions}` : ''}

Please extract all relevant information while maintaining business relationships and context. Structure your response to be immediately useful for business processing.

Focus on accuracy, completeness, and business relevance. If information is unclear or missing, note this explicitly.`;
  }

  private buildValidationPrompt(data: any, context: Record<string, any>): string {
    return `
You are Claude, an expert business analyst and data validator. Your task is to perform comprehensive validation of extracted business data, going beyond format checking to validate business logic and compliance.

Validation Task: Thoroughly validate this business data for accuracy, completeness, and business logic compliance.

Validation Framework:
1. Data Accuracy
   - Verify calculations and mathematical consistency
   - Check date logic and temporal relationships
   - Validate format compliance (phone, email, tax IDs)
   - Cross-reference related data points

2. Business Logic Validation
   - Verify business rule compliance
   - Check industry-standard practices
   - Validate workflow and process logic
   - Assess business relationship consistency

3. Compliance Assessment
   - Tax and regulatory compliance
   - Industry-specific requirements
   - Internal policy compliance
   - Legal and contractual obligations

4. Risk Assessment
   - Identify potential fraud indicators
   - Flag unusual patterns or anomalies
   - Assess financial and operational risks
   - Evaluate data quality and reliability

Data to Validate:
${JSON.stringify(data, null, 2)}

Business Context:
${JSON.stringify(context, null, 2)}

Please provide a comprehensive validation report with specific findings, risk assessments, and actionable recommendations.

Return your response in JSON format:
{
  "isValid": true,
  "confidence": 0.95,
  "criticalIssues": ["issue1", "issue2"],
  "warnings": ["warning1", "warning2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "businessLogicCheck": true,
  "complianceCheck": true
}`;
  }

  private buildBusinessInsightsPrompt(data: any, context?: Record<string, any>): string {
    return `
You are Claude, a senior business intelligence analyst with expertise in financial analysis, operational efficiency, and strategic planning. Your task is to generate actionable business insights from document data.

Business Intelligence Task: Analyze this business data to provide strategic insights and recommendations that drive business value.

Analysis Framework:
1. Executive Summary
   - Key findings in executive language
   - Business impact assessment
   - Strategic implications

2. Financial Analysis
   - Cost and revenue implications
   - Cash flow impact
   - Financial efficiency opportunities

3. Operational Insights
   - Process optimization opportunities
   - Resource allocation insights
   - Efficiency improvements

4. Risk and Opportunity Assessment
   - Business risks and mitigation strategies
   - Growth opportunities
   - Market insights

5. Strategic Recommendations
   - Immediate action items
   - Medium-term strategic moves
   - Long-term planning considerations

Business Data:
${JSON.stringify(data, null, 2)}

${context ? `\nAdditional Context:\n${JSON.stringify(context, null, 2)}` : ''}

Please provide comprehensive business intelligence that executives and managers can act upon immediately. Focus on business value, ROI, and competitive advantage.

Return your response in JSON format:
{
  "executiveSummary": "concise_executive_overview",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "actionItems": ["action1", "action2", "action3"],
  "priorityLevel": "high",
  "estimatedImpact": "detailed_impact_assessment"
}`;
  }

  private buildExplanationPrompt(data: any, decisions: any[]): string {
    return `
You are Claude, an expert at explaining complex AI processing decisions in clear, business-friendly language. Your task is to create a comprehensive explanation of how the document was processed and why specific decisions were made.

Explanation Task: Provide a clear, detailed explanation of the document processing workflow and decision-making process.

Explanation Components:
1. Processing Overview
   - High-level summary of what was accomplished
   - Key stages of processing
   - Technologies and methods used

2. Decision Rationale
   - Why specific classifications were made
   - How confidence scores were calculated
   - What factors influenced each decision

3. Data Quality Assessment
   - Source data quality and limitations
   - Processing challenges encountered
   - Validation steps performed

4. Business Impact
   - How the processing results affect business operations
   - Recommended next steps
   - Areas requiring human review

Processed Data:
${JSON.stringify(data, null, 2)}

Processing Decisions:
${JSON.stringify(decisions, null, 2)}

Please provide a clear, comprehensive explanation that helps business users understand and trust the AI processing results. Use business language and avoid technical jargon.`;
  }

  private buildOptimizationPrompt(processData: any, performanceMetrics: any): string {
    return `
You are Claude, a performance optimization expert specializing in business process improvement and AI efficiency. Your task is to analyze current processing performance and suggest specific optimizations.

Optimization Task: Analyze the current processing workflow and performance metrics to identify specific optimization opportunities.

Optimization Areas:
1. Processing Efficiency
   - Speed and throughput improvements
   - Resource utilization optimization
   - Bottleneck identification and resolution

2. Accuracy Enhancement
   - Error reduction strategies
   - Confidence score improvements
   - Quality assurance enhancements

3. Cost Optimization
   - Resource cost reduction
   - Processing time minimization
   - Infrastructure efficiency

4. User Experience
   - Workflow simplification
   - Response time improvements
   - Interface optimization

Process Data:
${JSON.stringify(processData, null, 2)}

Performance Metrics:
${JSON.stringify(performanceMetrics, null, 2)}

Please provide specific, actionable optimization recommendations with expected impact and implementation complexity.`;
  }

  // ==================== CLAUDE API CALLS ====================

  private async callClaude(prompt: string, image?: CapturedPhoto): Promise<ClaudeResponse> {
    try {
      const startTime = performance.now();

      const content = [];

      if (image) {
        // For Claude 3 with vision capabilities
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: image.dataUrl.split(',')[1] // Remove data URL prefix
          }
        });
      }

      content.push({
        type: 'text',
        text: prompt
      });

      const response = await fetch(`${this.config.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: image ? this.config.model.vision : this.config.model.text,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            {
              role: 'user',
              content
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = performance.now() - startTime;

      const claudeResponse: ClaudeResponse = {
        content: data.content[0].text,
        confidence: 0.9, // Claude doesn't provide explicit confidence, estimate based on quality
        reasoning: 'Claude analysis completed',
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens
        },
        processingTime
      };

      // Try to parse structured result if JSON format expected
      try {
        if (data.content[0].text.includes('{') && data.content[0].text.includes('}')) {
          const jsonMatch = data.content[0].text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            claudeResponse.structuredResult = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (parseError) {
        // Non-JSON response is fine
      }

      return claudeResponse;

    } catch (error) {
      console.error('❌ HERA: Claude API call failed:', error);
      throw error;
    }
  }

  // ==================== RESPONSE PARSERS ====================

  private parseDocumentAnalysis(response: ClaudeResponse): DocumentAnalysis {
    if (response.structuredResult) {
      return {
        documentType: response.structuredResult.documentType || 'unknown',
        confidence: response.structuredResult.confidence || 0.8,
        keyFeatures: response.structuredResult.keyFeatures || [],
        businessContext: response.structuredResult.businessContext || response.content,
        recommendations: response.structuredResult.recommendations || [],
        structuredData: response.structuredResult.structuredData
      };
    }

    // Parse from text if structured result not available
    return {
      documentType: 'unknown',
      confidence: 0.8,
      keyFeatures: [],
      businessContext: response.content,
      recommendations: [],
      structuredData: null
    };
  }

  private parseExtractionResult(response: ClaudeResponse): any {
    if (response.structuredResult) {
      return response.structuredResult;
    }

    // Try to extract structured data from text response
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Could not parse structured extraction result');
    }

    return { extractedText: response.content };
  }

  private parseValidationResult(response: ClaudeResponse): ValidationAnalysis {
    if (response.structuredResult) {
      return {
        isValid: response.structuredResult.isValid || false,
        confidence: response.structuredResult.confidence || 0.8,
        criticalIssues: response.structuredResult.criticalIssues || [],
        warnings: response.structuredResult.warnings || [],
        suggestions: response.structuredResult.suggestions || [],
        businessLogicCheck: response.structuredResult.businessLogicCheck || false,
        complianceCheck: response.structuredResult.complianceCheck || false
      };
    }

    return {
      isValid: false,
      confidence: 0.5,
      criticalIssues: [],
      warnings: [],
      suggestions: [],
      businessLogicCheck: false,
      complianceCheck: false
    };
  }

  private parseBusinessInsights(response: ClaudeResponse): BusinessInsights {
    if (response.structuredResult) {
      return {
        executiveSummary: response.structuredResult.executiveSummary || '',
        keyFindings: response.structuredResult.keyFindings || [],
        riskFactors: response.structuredResult.riskFactors || [],
        opportunities: response.structuredResult.opportunities || [],
        actionItems: response.structuredResult.actionItems || [],
        priorityLevel: response.structuredResult.priorityLevel || 'medium',
        estimatedImpact: response.structuredResult.estimatedImpact || ''
      };
    }

    return {
      executiveSummary: response.content,
      keyFindings: [],
      riskFactors: [],
      opportunities: [],
      actionItems: [],
      priorityLevel: 'medium',
      estimatedImpact: ''
    };
  }

  private parseSchemaResponse(response: ClaudeResponse): any {
    if (response.structuredResult) {
      return response.structuredResult;
    }

    // Try to parse from text response
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Could not parse Claude schema response');
    }

    // Return minimal schema if parsing fails
    return {
      entityType: 'custom_entity',
      name: 'Custom Entity',
      domain: { name: 'general', confidence: 0.8 },
      fields: [],
      confidence: 0.8,
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

  private parseOptimizationSuggestions(response: ClaudeResponse): string[] {
    if (response.structuredResult && response.structuredResult.suggestions) {
      return response.structuredResult.suggestions;
    }

    // Extract suggestions from text
    const suggestions = response.content
      .split('\n')
      .filter(line => line.includes('•') || line.includes('-') || line.includes('1.'))
      .map(line => line.replace(/^[\s\-\•\d\.]+/, '').trim())
      .filter(line => line.length > 0);

    return suggestions;
  }

  // ==================== UTILITY METHODS ====================

  async estimateTokens(text: string): Promise<number> {
    // Rough token estimation (Claude uses similar tokenization to GPT)
    return Math.ceil(text.length / 4);
  }

  getRequestHistory(): ClaudeRequest[] {
    return [...this.requestHistory];
  }

  clearRequestHistory(): void {
    this.requestHistory = [];
  }

  updateConfig(config: Partial<AnthropicConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getUsageStats(): any {
    return {
      totalRequests: this.requestHistory.length,
      averageProcessingTime: 0 // Calculate from history
    };
  }
}

// ==================== FACTORY FUNCTION ====================

export function createAnthropicIntegration(config: AnthropicConfig): AnthropicIntegrationService {
  return new AnthropicIntegrationService(config);
}

// ==================== SINGLETON INSTANCE ====================

export const anthropicIntegration = createAnthropicIntegration({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: {
    vision: 'claude-3-opus-20240229',
    text: 'claude-3-sonnet-20240229'
  },
  maxTokens: 4000,
  temperature: 0.1
});

export default anthropicIntegration;