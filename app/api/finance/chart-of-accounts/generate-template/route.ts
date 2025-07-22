/**
 * HERA Universal - Claude AI Chart of Accounts Template Generation
 * 
 * Generates comprehensive, industry-specific COA templates using Claude AI
 * Stores templates for reference in future account creation and migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { claudeAI } from '@/utils/claude-ai-service';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface TemplateGenerationRequest {
  businessType: string;
  businessDetails?: {
    cuisineType?: string[];
    services?: string[];
    size?: 'small' | 'medium' | 'large' | 'enterprise';
    locations?: number;
    specialRequirements?: string[];
  };
  regenerate?: boolean; // Force new generation even if template exists
}

interface TemplateAccount {
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
               'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  description: string;
  keywords: string[];
  commonAliases: string[];
  parentAccount?: string;
  isActive: boolean;
  allowPosting: boolean;
  businessRules?: {
    reconciliationRequired?: boolean;
    reconciliationFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    minBalance?: number;
    maxTransaction?: number;
    approvalRequired?: boolean;
    approvalThreshold?: number;
  };
  industryNotes?: string;
  complianceNotes?: string;
  aiMetadata: {
    confidence: number;
    usageFrequency: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    criticalAccount: boolean;
    seasonalVariation?: boolean;
    priority: 'essential' | 'recommended' | 'optional';
  };
}

interface GeneratedTemplate {
  templateId: string;
  businessType: string;
  version: number;
  generatedAt: string;
  generatedBy: string;
  metadata: {
    totalAccounts: number;
    categories: Record<string, number>;
    businessDetails?: any;
  };
  accounts: TemplateAccount[];
}

// Build Claude prompt for template generation
const buildTemplatePrompt = (request: TemplateGenerationRequest): string => {
  const { businessType, businessDetails } = request;
  
  let prompt = `You are a senior accountant specializing in ${businessType} operations. Generate a comprehensive Chart of Accounts template for a ${businessType} with the following characteristics:

Business Type: ${businessType}
`;

  if (businessDetails) {
    if (businessDetails.cuisineType?.length) {
      prompt += `Cuisine: ${businessDetails.cuisineType.join(', ')}\n`;
    }
    if (businessDetails.services?.length) {
      prompt += `Services: ${businessDetails.services.join(', ')}\n`;
    }
    if (businessDetails.size) {
      prompt += `Business Size: ${businessDetails.size}\n`;
    }
    if (businessDetails.locations) {
      prompt += `Number of Locations: ${businessDetails.locations}\n`;
    }
    if (businessDetails.specialRequirements?.length) {
      prompt += `Special Features: ${businessDetails.specialRequirements.join(', ')}\n`;
    }
  }

  prompt += `
Requirements:
1. Include ALL accounts a ${businessType} would need (minimum 100 accounts, maximum 150)
2. Use HERA's 7-digit numbering system:
   - 1xxxxxx for ASSETS
   - 2xxxxxx for LIABILITIES
   - 3xxxxxx for EQUITY
   - 4xxxxxx for REVENUE
   - 5xxxxxx for COST_OF_SALES
   - 6xxxxxx for DIRECT_EXPENSES
   - 7xxxxxx for INDIRECT_EXPENSES
   - 8xxxxxx for TAX_EXPENSES
   - 9xxxxxx for EXTRAORDINARY_EXPENSES

3. For each account, include:
   - accountCode: 7-digit code following the pattern above
   - accountName: Clear, descriptive name
   - accountType: One of the 9 categories above
   - description: 1-2 sentence explanation of what this account is used for
   - keywords: Array of 3-5 searchable keywords
   - commonAliases: Array of 2-3 alternative names this account might be called
   - isActive: true
   - allowPosting: true for detail accounts, false for header accounts
   - businessRules: Include for critical accounts (reconciliation requirements, balance limits, etc.)
   - industryNotes: Best practices specific to ${businessType} industry
   - complianceNotes: Any regulatory or compliance considerations
   - aiMetadata: {
       confidence: 0.8-0.99 based on how standard this account is
       usageFrequency: "very_high", "high", "medium", "low", or "very_low"
       criticalAccount: true/false if this is essential for operations
       seasonalVariation: true/false if usage varies by season
       priority: "essential", "recommended", or "optional"
     }

4. Include both common and edge-case accounts
5. Consider industry best practices and compliance requirements
6. Group related accounts with sequential numbering
7. Include proper parent-child relationships where applicable

Return ONLY a valid JSON object with this structure:
{
  "accounts": [
    {
      "accountCode": "1001000",
      "accountName": "Cash - Operating Account",
      "accountType": "ASSET",
      "description": "Primary operating cash for daily transactions",
      "keywords": ["cash", "operating", "bank", "checking"],
      "commonAliases": ["Petty Cash", "Cash on Hand", "Operating Cash"],
      "isActive": true,
      "allowPosting": true,
      "businessRules": {
        "reconciliationRequired": true,
        "reconciliationFrequency": "daily",
        "minBalance": 5000
      },
      "industryNotes": "Critical for daily operations. Recommend daily reconciliation.",
      "complianceNotes": "Maintain audit trail for all cash transactions",
      "aiMetadata": {
        "confidence": 0.99,
        "usageFrequency": "very_high",
        "criticalAccount": true,
        "seasonalVariation": false,
        "priority": "essential"
      }
    }
    // ... more accounts
  ]
}`;

  return prompt;
};

// Check if template already exists
const getExistingTemplate = async (
  supabase: any, 
  businessType: string,
  version?: number
): Promise<GeneratedTemplate | null> => {
  try {
    // Query for existing template
    const { data: templateEntity } = await supabase
      .from('core_entities')
      .select('id, entity_code, created_at')
      .eq('organization_id', '00000000-0000-0000-0000-000000000001') // System org
      .eq('entity_type', 'coa_template')
      .ilike('entity_code', `CLAUDE_${businessType.toUpperCase().replace(/\s+/g, '_')}_COA_V%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!templateEntity) {
      return null;
    }

    // Get template data
    const { data: templateData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', templateEntity.id);

    if (!templateData || templateData.length === 0) {
      return null;
    }

    // Reconstruct template
    const accounts: TemplateAccount[] = [];
    let metadata: any = null;

    templateData.forEach((field: any) => {
      if (field.field_name === 'template_metadata') {
        metadata = JSON.parse(field.field_value);
      } else if (field.field_name.startsWith('account_')) {
        accounts.push(JSON.parse(field.field_value));
      }
    });

    const versionMatch = templateEntity.entity_code.match(/_V(\d+)$/);
    const templateVersion = versionMatch ? parseInt(versionMatch[1]) : 1;

    return {
      templateId: templateEntity.entity_code,
      businessType: metadata?.businessType || businessType,
      version: templateVersion,
      generatedAt: templateEntity.created_at,
      generatedBy: 'Claude AI',
      metadata: metadata || { totalAccounts: accounts.length, categories: {} },
      accounts
    };
  } catch (error) {
    console.error('Error fetching existing template:', error);
    return null;
  }
};

// Save template to database
const saveTemplate = async (
  supabase: any,
  template: GeneratedTemplate
): Promise<void> => {
  const templateEntityId = crypto.randomUUID();
  
  // Create template entity
  const { error: entityError } = await supabase
    .from('core_entities')
    .insert({
      id: templateEntityId,
      organization_id: '00000000-0000-0000-0000-000000000001', // System org
      entity_type: 'coa_template',
      entity_code: template.templateId,
      entity_name: `Claude AI ${template.businessType} COA Template v${template.version}`,
      is_active: true
    });

  if (entityError) {
    throw new Error(`Failed to create template entity: ${entityError.message}`);
  }

  // Save template metadata
  const dynamicDataRecords = [
    {
      entity_id: templateEntityId,
      field_name: 'template_metadata',
      field_value: JSON.stringify(template.metadata),
      field_type: 'json'
    }
  ];

  // Save each account
  template.accounts.forEach((account, index) => {
    dynamicDataRecords.push({
      entity_id: templateEntityId,
      field_name: `account_${account.accountCode}`,
      field_value: JSON.stringify(account),
      field_type: 'template_account'
    });
  });

  // Batch insert dynamic data
  const { error: dataError } = await supabase
    .from('core_dynamic_data')
    .insert(dynamicDataRecords);

  if (dataError) {
    throw new Error(`Failed to save template data: ${dataError.message}`);
  }
};

// POST /api/finance/chart-of-accounts/generate-template
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: TemplateGenerationRequest = await request.json();

    console.log('🧠 COA Template Generation Request:', {
      businessType: body.businessType,
      regenerate: body.regenerate,
      businessDetails: body.businessDetails
    });

    // Validate request
    if (!body.businessType) {
      return NextResponse.json(
        { error: 'businessType is required' },
        { status: 400 }
      );
    }

    // Check for existing template unless regeneration is requested
    if (!body.regenerate) {
      const existingTemplate = await getExistingTemplate(supabase, body.businessType);
      
      if (existingTemplate) {
        console.log('✅ Using existing template:', existingTemplate.templateId);
        
        return NextResponse.json({
          success: true,
          data: {
            template: existingTemplate,
            source: 'cached',
            message: `Found existing template with ${existingTemplate.accounts.length} accounts`
          }
        });
      }
    }

    // Generate new template using Claude AI
    console.log('🤖 Generating new template with Claude AI...');
    
    if (!claudeAI.isAvailable()) {
      return NextResponse.json(
        { error: 'Claude AI service is not available. Please configure ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const prompt = buildTemplatePrompt(body);
    const aiResponse = await claudeAI.generateTemplate(prompt);

    if (!aiResponse || !aiResponse.accounts || !Array.isArray(aiResponse.accounts)) {
      throw new Error('Invalid response from Claude AI');
    }

    // Calculate metadata
    const metadata = {
      totalAccounts: aiResponse.accounts.length,
      categories: aiResponse.accounts.reduce((acc, account) => {
        acc[account.accountType] = (acc[account.accountType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      businessDetails: body.businessDetails,
      generationPrompt: prompt.substring(0, 500) + '...' // Store truncated prompt
    };

    // Determine version number
    const existingTemplate = await getExistingTemplate(supabase, body.businessType);
    const version = existingTemplate ? existingTemplate.version + 1 : 1;

    // Create template object
    const template: GeneratedTemplate = {
      templateId: `CLAUDE_${body.businessType.toUpperCase().replace(/\s+/g, '_')}_COA_V${version}`,
      businessType: body.businessType,
      version,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Claude AI',
      metadata,
      accounts: aiResponse.accounts
    };

    // Save template to database
    await saveTemplate(supabase, template);

    console.log('✅ Template generated and saved:', {
      templateId: template.templateId,
      totalAccounts: template.accounts.length,
      categories: metadata.categories
    });

    return NextResponse.json({
      success: true,
      data: {
        template,
        source: 'generated',
        message: `Generated new template with ${template.accounts.length} accounts`
      }
    });

  } catch (error) {
    console.error('❌ Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

// GET /api/finance/chart-of-accounts/generate-template
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const businessType = searchParams.get('businessType');
    const version = searchParams.get('version');

    if (!businessType) {
      // List all available templates
      const { data: templates } = await supabase
        .from('core_entities')
        .select('entity_code, entity_name, created_at')
        .eq('organization_id', '00000000-0000-0000-0000-000000000001')
        .eq('entity_type', 'coa_template')
        .order('created_at', { ascending: false });

      return NextResponse.json({
        success: true,
        data: {
          templates: templates || [],
          message: `Found ${templates?.length || 0} templates`
        }
      });
    }

    // Get specific template
    const template = await getExistingTemplate(
      supabase, 
      businessType, 
      version ? parseInt(version) : undefined
    );

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { template }
    });

  } catch (error) {
    console.error('❌ Template fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}