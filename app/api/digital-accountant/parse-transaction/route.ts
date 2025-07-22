/**
 * HERA Digital Accountant - Text-to-Journal Entry Parser
 * 
 * Uses Claude API to parse natural language transaction descriptions
 * and generate journal entries with appropriate account mappings
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface TransactionParseRequest {
  organizationId: string;
  transactionText: string;
  businessType?: string;
  chartOfAccounts?: Array<{
    accountCode: string;
    accountName: string;
    accountType: string;
  }>;
}

interface ParsedJournalEntry {
  description: string;
  amount: number;
  entryDate: string;
  entries: Array<{
    accountCode: string;
    accountName: string;
    debit?: number;
    credit?: number;
    description?: string;
  }>;
  confidence: number;
  reasoning: string;
  suggestions: string[];
}

// POST /api/digital-accountant/parse-transaction
export async function POST(request: NextRequest) {
  try {
    const body: TransactionParseRequest = await request.json();

    console.log('🧠 Parsing transaction with Claude:', body.transactionText);

    if (!body.organizationId || !body.transactionText) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, transactionText' },
        { status: 400 }
      );
    }

    // HERA Chart of Accounts structure - following exact numbering from AI generate route
    const heraAccountsContext = `HERA Chart of Accounts Structure (7-digit codes):

ASSETS (1000000-1999999):
- 1001000: Cash - Operating Account
- 1002000: Accounts Receivable - Credit Sales  
- 1003000: Food Inventory
- 1004000: Beverage Inventory
- 1005000: Kitchen Equipment
- 1006000: Furniture & Fixtures

LIABILITIES (2000000-2999999):
- 2001000: Accounts Payable - Food Suppliers
- 2002000: Accrued Payroll
- 2003000: Sales Tax Payable

EQUITY (3000000-3999999):
- 3001000: Owner's Equity

REVENUE (4000000-4999999):
- 4001000: Food Sales Revenue
- 4002000: Beverage Sales Revenue
- 4003000: Catering Revenue
- 4004000: Delivery Service Revenue

COST OF SALES (5000000-5999999):
- 5001000: Food Cost
- 5002000: Beverage Cost

DIRECT EXPENSES (6000000-6999999):
- 6001000: Kitchen Staff Wages
- 6002000: Server Wages & Tips
- 6003000: Utilities - Kitchen
- 6004000: Rent - Restaurant Space

INDIRECT EXPENSES (7000000-7999999):
- 7001000: Marketing & Advertising
- 7002000: Insurance
- 7003000: Professional Services
- 7004000: Office Supplies
- 7005000: Delivery Platform Fees

TAX EXPENSES (8000000-8999999):
- 8001000: Business License Fees
- 8002000: Payroll Taxes

Additional context from user's chart of accounts:
${body.chartOfAccounts ? 
  body.chartOfAccounts.map(acc => `${acc.accountCode}: ${acc.accountName} (${acc.accountType})`).join('\n')
  : 'Using HERA standard restaurant accounts'}

Business Type: ${body.businessType || 'Restaurant'}

Transaction Description: "${body.transactionText}"

Please analyze this transaction and create a proper journal entry using HERA's numbering system. Return a JSON object with the following structure:

{
  "description": "Clear description of the transaction",
  "amount": 0, // Total transaction amount
  "entryDate": "YYYY-MM-DD", // Today's date or inferred date
  "entries": [
    {
      "accountCode": "1234567", // 7-digit HERA account code
      "accountName": "Account Name from HERA system",
      "debit": 100.00, // Amount to debit (or 0)
      "credit": 0, // Amount to credit (or 0)
      "description": "Line item description"
    }
  ],
  "confidence": 0.95, // Confidence score 0-1
  "reasoning": "Explanation of why these HERA accounts were chosen",
  "suggestions": ["Review amount", "Verify account mapping"]
}

CRITICAL RULES:
1. MUST use HERA's 7-digit account codes from the structure above
2. Journal entries must balance (total debits = total credits)  
3. Use proper accounting principles (assets/expenses = debits, liabilities/equity/revenue = credits)
4. Common restaurant transaction patterns:
   - Food purchases: Debit Food Cost (5001000), Credit Accounts Payable - Food Suppliers (2001000)
   - Cash food sales: Debit Cash - Operating Account (1001000), Credit Food Sales Revenue (4001000)
   - Rent payment: Debit Rent - Restaurant Space (6004000), Credit Cash - Operating Account (1001000)
   - Equipment purchase: Debit Kitchen Equipment (1005000), Credit Cash (1001000) or Accounts Payable (2001000)
   - Staff wages: Debit Kitchen Staff Wages (6001000) or Server Wages (6002000), Credit Accrued Payroll (2002000)
   - Utilities: Debit Utilities - Kitchen (6003000), Credit Cash (1001000) or Accounts Payable (2001000)
5. If unsure about amounts, provide reasonable estimates but lower confidence
6. Always include helpful suggestions for the user to review

Return ONLY the JSON object, no additional text.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const claudeResponse = response.content[0];
    if (claudeResponse.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse Claude's response
    let parsedEntry: ParsedJournalEntry;
    try {
      parsedEntry = JSON.parse(claudeResponse.text);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response:', claudeResponse.text);
      throw new Error('Failed to parse AI response. Please try again with a clearer description.');
    }

    // Validate the parsed entry
    if (!parsedEntry.entries || parsedEntry.entries.length === 0) {
      throw new Error('AI could not generate valid journal entries from the description');
    }

    // Calculate totals and verify balance
    const totalDebits = parsedEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = parsedEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    if (!isBalanced) {
      console.warn('⚠️ AI generated unbalanced entry, attempting to fix...');
      // Try to fix common balance issues
      if (parsedEntry.entries.length === 2) {
        const firstEntry = parsedEntry.entries[0];
        const secondEntry = parsedEntry.entries[1];
        
        if (firstEntry.debit && !secondEntry.credit) {
          secondEntry.credit = firstEntry.debit;
          secondEntry.debit = 0;
        } else if (firstEntry.credit && !secondEntry.debit) {
          secondEntry.debit = firstEntry.credit;
          secondEntry.credit = 0;
        }
      }
    }

    console.log('✅ Successfully parsed transaction with confidence:', parsedEntry.confidence);

    return NextResponse.json({
      success: true,
      data: parsedEntry,
      metadata: {
        aiGenerated: true,
        modelUsed: 'claude-3-sonnet',
        processingTime: new Date().toISOString(),
        balanceCheck: {
          totalDebits: totalDebits,
          totalCredits: totalCredits,
          isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
        }
      }
    });

  } catch (error) {
    console.error('❌ Transaction parsing error:', error);
    
    // Return user-friendly error message
    let errorMessage = 'Failed to parse transaction';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('parse')) {
        errorMessage = 'Could not understand the transaction description. Please try being more specific.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}