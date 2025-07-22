/**
 * HERA Universal - Chart of Accounts CSV/Excel Import
 * 
 * Handles file uploads and parses common accounting software exports
 * Supports QuickBooks, Xero, Sage, Excel, and generic CSV formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface ImportRequest {
  organizationId: string;
  fileContent: string; // Base64 encoded or CSV text
  fileFormat: 'csv' | 'excel' | 'quickbooks' | 'xero' | 'sage' | 'auto_detect';
  fieldMapping?: Record<string, string>; // CSV column -> account field mapping
  hasHeaders?: boolean;
  skipRows?: number;
  previewMode?: boolean; // Just parse and preview, don't migrate
}

interface ParsedAccount {
  originalCode: string;
  originalName: string;
  originalType?: string;
  originalCategory?: string;
  description?: string;
  balance?: number;
  isActive?: boolean;
  parentCode?: string;
  level?: number;
  rowNumber: number;
  rawData: Record<string, any>;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  parsedAccounts: number;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  warnings: Array<{
    row: number;
    warning: string;
    data: Record<string, any>;
  }>;
  accounts: ParsedAccount[];
  detectedFormat?: string;
  suggestedFieldMapping?: Record<string, string>;
}

// Common field mappings for different accounting software
const FIELD_MAPPINGS = {
  quickbooks: {
    'Account Code': 'originalCode',
    'Account': 'originalName',
    'Type': 'originalType',
    'Detail Type': 'originalCategory',
    'Description': 'description',
    'Balance': 'balance',
    'Active': 'isActive'
  },
  xero: {
    'Code': 'originalCode',
    'Name': 'originalName',
    'Type': 'originalType',
    'Tax Type': 'originalCategory',
    'Description': 'description',
    'Balance': 'balance',
    'Status': 'isActive'
  },
  sage: {
    'A/C': 'originalCode',
    'Name': 'originalName',
    'Type': 'originalType',
    'Department': 'originalCategory',
    'Balance': 'balance'
  },
  tally: {
    'guid': 'originalCode',
    'name': 'originalName',
    'gl code name': 'originalName',
    'parent': 'originalType',
    'primarygroup': 'originalCategory',
    'closing_balance': 'balance',
    'opening_balance': 'balance',
    'description': 'description',
    'notes': 'description'
  },
  generic: {
    'code': 'originalCode',
    'account_code': 'originalCode',
    'account_number': 'originalCode',
    'guid': 'originalCode',
    'name': 'originalName',
    'account_name': 'originalName',
    'title': 'originalName',
    'type': 'originalType',
    'account_type': 'originalType',
    'category': 'originalCategory',
    'parent': 'originalType',
    'primarygroup': 'originalCategory',
    'description': 'description',
    'notes': 'description',
    'balance': 'balance',
    'current_balance': 'balance',
    'opening_balance': 'balance',
    'closing_balance': 'balance',
    'active': 'isActive',
    'is_active': 'isActive',
    'status': 'isActive',
    'parent_code': 'parentCode',
    'level': 'level'
  }
};

// Detect accounting software format based on headers
const detectFormat = (headers: string[]): string => {
  const headerStr = headers.join('|').toLowerCase();
  
  if (headerStr.includes('account code') && headerStr.includes('detail type')) {
    return 'quickbooks';
  }
  if (headerStr.includes('code') && headerStr.includes('tax type')) {
    return 'xero';
  }
  if (headerStr.includes('a/c') && headerStr.includes('department')) {
    return 'sage';
  }
  // Detect Tally-like format (like your MST Ledger)
  if (headerStr.includes('guid') && headerStr.includes('primarygroup') && headerStr.includes('closing_balance')) {
    return 'tally';
  }
  
  return 'generic';
};

// Enhanced CSV parser to handle complex real-world CSV files
const parseCSV = (content: string): string[][] => {
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');
  
  const lines = cleanContent.split('\n').filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator outside quotes
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    // Add the last field
    fields.push(current.trim());
    result.push(fields);
  }
  
  return result;
};

// Clean and validate field values
const cleanFieldValue = (value: any, fieldType: string): any => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const strValue = String(value).trim();
  
  switch (fieldType) {
    case 'balance':
      // Remove currency symbols and parse number
      const cleanNumber = strValue.replace(/[$,£€¥]/g, '').replace(/[()]/g, '-');
      const parsed = parseFloat(cleanNumber);
      return isNaN(parsed) ? 0 : parsed;
      
    case 'isActive':
      // Handle various boolean representations
      const lower = strValue.toLowerCase();
      if (lower === 'true' || lower === 'active' || lower === 'yes' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === 'inactive' || lower === 'no' || lower === '0') {
        return false;
      }
      return true; // Default to active
      
    case 'level':
      const levelNum = parseInt(strValue);
      return isNaN(levelNum) ? 0 : levelNum;
      
    default:
      return strValue;
  }
};

// Parse accounts from CSV data
const parseAccountsFromCSV = (
  csvData: string[][],
  fieldMapping: Record<string, string>,
  hasHeaders: boolean = true,
  skipRows: number = 0
): { accounts: ParsedAccount[]; errors: any[]; warnings: any[] } => {
  const accounts: ParsedAccount[] = [];
  const errors: any[] = [];
  const warnings: any[] = [];
  
  let startRow = skipRows;
  let headers: string[] = [];
  
  if (hasHeaders && csvData.length > skipRows) {
    headers = csvData[skipRows];
    startRow = skipRows + 1;
  }
  
  for (let i = startRow; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNum = i + 1;
    
    // Skip empty rows
    if (row.length === 0 || row.every(cell => !cell || !cell.trim())) {
      continue;
    }
    
    try {
      const rawData: Record<string, any> = {};
      
      // Map CSV columns to raw data
      if (hasHeaders) {
        headers.forEach((header, index) => {
          if (index < row.length) {
            rawData[header] = row[index];
          }
        });
      } else {
        row.forEach((value, index) => {
          rawData[`column_${index}`] = value;
        });
      }
      
      // Apply field mapping
      const accountData: any = {
        rowNumber: rowNum,
        rawData
      };
      
      Object.entries(fieldMapping).forEach(([csvField, accountField]) => {
        const csvValue = rawData[csvField];
        if (csvValue !== undefined && csvValue !== null) {
          accountData[accountField] = cleanFieldValue(csvValue, accountField);
        }
      });
      
      // More lenient validation - try to extract what we can
      if (!accountData.originalCode && !accountData.originalName) {
        errors.push({
          row: rowNum,
          error: 'Missing both account code and name',
          data: rawData
        });
        continue;
      }
      
      // If no code but has name, use name as code
      if (!accountData.originalCode && accountData.originalName) {
        accountData.originalCode = accountData.originalName.substring(0, 20);
      }
      
      // If no name but has code, use code as name
      if (!accountData.originalName && accountData.originalCode) {
        accountData.originalName = accountData.originalCode;
      }
      
      // Validate account code format (if numeric, keep as is; if text, clean it)
      if (accountData.originalCode && typeof accountData.originalCode === 'string') {
        accountData.originalCode = accountData.originalCode.replace(/[^a-zA-Z0-9-_]/g, '');
      }
      
      accounts.push(accountData as ParsedAccount);
      
    } catch (error) {
      errors.push({
        row: rowNum,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: row.reduce((obj, value, index) => {
          obj[`column_${index}`] = value;
          return obj;
        }, {} as Record<string, any>)
      });
    }
  }
  
  return { accounts, errors, warnings };
};

// POST /api/finance/chart-of-accounts/import-csv
export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();

    console.log('📤 COA CSV Import Request:', {
      organizationId: body.organizationId,
      fileFormat: body.fileFormat,
      previewMode: body.previewMode,
      hasHeaders: body.hasHeaders
    });

    // Validate request
    if (!body.organizationId || !body.fileContent) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, fileContent' },
        { status: 400 }
      );
    }

    let csvContent = body.fileContent;
    
    // Handle base64 encoded content
    if (body.fileContent.includes('base64,')) {
      try {
        const base64Data = body.fileContent.split('base64,')[1];
        csvContent = atob(base64Data);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid base64 file content' },
          { status: 400 }
        );
      }
    }

    // Parse CSV
    const csvData = parseCSV(csvContent);
    
    console.log('🔍 CSV parsed:', csvData.length, 'rows');
    if (csvData.length > 0) {
      console.log('🔍 Headers detected:', csvData[0]?.slice(0, 6), '... (first 6 columns)');
      console.log('🔍 First data row fields:', csvData[1]?.slice(0, 6), '...');
    }
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    // Detect format if auto-detection requested
    let detectedFormat = body.fileFormat;
    let fieldMapping = body.fieldMapping || {};
    
    if (body.fileFormat === 'auto_detect' || !body.fieldMapping) {
      detectedFormat = detectFormat(csvData[0]);
      const baseMapping = FIELD_MAPPINGS[detectedFormat as keyof typeof FIELD_MAPPINGS] || FIELD_MAPPINGS.generic;
      
      // Create case-insensitive field mapping
      fieldMapping = {};
      const headers = csvData[0] || [];
      
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
        
        // Check exact match first
        if (baseMapping[header]) {
          fieldMapping[header] = baseMapping[header];
        }
        // Check normalized match
        else if (baseMapping[normalizedHeader]) {
          fieldMapping[header] = baseMapping[normalizedHeader];
        }
        // Check common variations
        else if (normalizedHeader.includes('code') || normalizedHeader.includes('number')) {
          fieldMapping[header] = 'originalCode';
        }
        else if (normalizedHeader.includes('name') || normalizedHeader.includes('title')) {
          fieldMapping[header] = 'originalName';
        }
        else if (normalizedHeader.includes('type') || normalizedHeader.includes('category')) {
          fieldMapping[header] = 'originalType';
        }
        else if (normalizedHeader.includes('description')) {
          fieldMapping[header] = 'description';
        }
        else if (normalizedHeader.includes('balance')) {
          fieldMapping[header] = 'balance';
        }
      });
    }

    console.log('🗺️ Field mapping being used:', fieldMapping);

    // Parse accounts
    const { accounts, errors, warnings } = parseAccountsFromCSV(
      csvData,
      fieldMapping,
      body.hasHeaders ?? true,
      body.skipRows ?? 0
    );

    const result: ImportResult = {
      success: true,
      totalRows: csvData.length - (body.skipRows ?? 0) - (body.hasHeaders ? 1 : 0),
      parsedAccounts: accounts.length,
      errors,
      warnings,
      accounts,
      detectedFormat,
      suggestedFieldMapping: fieldMapping
    };

    console.log('✅ CSV Import Parsed:', {
      totalRows: result.totalRows,
      parsedAccounts: result.parsedAccounts,
      errors: result.errors.length,
      detectedFormat
    });

    // Debug: Log first few errors and successful accounts
    if (result.errors && result.errors.length > 0) {
      console.log('❌ First 3 parsing errors:');
      result.errors.slice(0, 3).forEach((error, i) => {
        console.log(`  ${i + 1}. Row ${error.row}: ${error.error}`);
        const dataKeys = Object.keys(error.data || {});
        const dataSample = dataKeys.slice(0, 5).map(key => `${key}="${error.data[key]}"`).join(', ');
        console.log(`     Data sample (${dataKeys.length} fields): ${dataSample}`);
      });
    }

    if (result.accounts && result.accounts.length > 0) {
      console.log('✅ First 2 successful accounts:');
      result.accounts.slice(0, 2).forEach((acc, i) => {
        console.log(`  ${i + 1}. ${acc.originalName} (${acc.originalCode}) - Type: ${acc.originalType || 'N/A'}`);
      });
    }

    // If preview mode, return parse results
    if (body.previewMode) {
      return NextResponse.json({
        success: true,
        data: result,
        message: `Parsed ${result.parsedAccounts} accounts from ${result.totalRows} rows`
      });
    }

    // If not preview mode, proceed with migration
    const migrationResponse = await fetch(`${request.url.replace('/import-csv', '/migrate-legacy')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: body.organizationId,
        accounts: accounts,
        migrationMode: 'execute',
        mappingStrategy: 'ai_smart',
        conflictResolution: 'skip'
      })
    });

    if (!migrationResponse.ok) {
      throw new Error('Failed to execute migration');
    }

    const migrationResult = await migrationResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        importResult: result,
        migrationResult: migrationResult.data
      },
      message: `Import completed: ${result.parsedAccounts} accounts parsed, migration in progress`
    });

  } catch (error) {
    console.error('❌ CSV Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

// GET /api/finance/chart-of-accounts/import-csv (for templates and examples)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'generic';

    // Return CSV template based on format
    const templates = {
      quickbooks: {
        headers: ['Account Code', 'Account', 'Type', 'Detail Type', 'Description', 'Balance', 'Active'],
        example: [
          '1000', 'Cash - Checking', 'Bank', 'Checking', 'Primary business checking account', '5000.00', 'true',
          '1200', 'Accounts Receivable', 'Accounts Receivable', 'Accounts Receivable', 'Customer invoices outstanding', '2500.00', 'true',
          '4000', 'Sales Revenue', 'Income', 'Sales of Product Income', 'Revenue from food sales', '-15000.00', 'true'
        ]
      },
      xero: {
        headers: ['Code', 'Name', 'Type', 'Tax Type', 'Description', 'Balance', 'Status'],
        example: [
          '1000', 'Business Bank Account', 'BANK', 'GST on Income', 'Main business account', '5000.00', 'ACTIVE',
          '1200', 'Accounts Receivable', 'CURRENT', 'GST on Income', 'Customer receivables', '2500.00', 'ACTIVE',
          '4000', 'Sales', 'REVENUE', 'GST on Income', 'Sales revenue', '15000.00', 'ACTIVE'
        ]
      },
      generic: {
        headers: ['code', 'name', 'type', 'description', 'balance', 'active'],
        example: [
          '1001', 'Cash Account', 'Asset', 'Primary cash account', '5000.00', 'true',
          '1200', 'Accounts Receivable', 'Asset', 'Customer receivables', '2500.00', 'true',
          '4001', 'Food Sales', 'Revenue', 'Restaurant food sales', '15000.00', 'true'
        ]
      }
    };

    const template = templates[format as keyof typeof templates] || templates.generic;

    return NextResponse.json({
      success: true,
      data: {
        format,
        headers: template.headers,
        exampleRows: template.example,
        csvTemplate: [template.headers, ...template.example].map(row => 
          Array.isArray(row) ? row.join(',') : row
        ).join('\n'),
        fieldMapping: FIELD_MAPPINGS[format as keyof typeof FIELD_MAPPINGS] || FIELD_MAPPINGS.generic
      }
    });

  } catch (error) {
    console.error('❌ Template request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}