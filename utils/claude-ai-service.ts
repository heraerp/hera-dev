/**
 * Claude AI Service for HERA Chart of Accounts
 * 
 * Provides intelligent account mapping and generation using Claude API
 * Used as smart path for complex cases that rule-based logic can't handle
 */

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  role: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AccountMappingRequest {
  originalCode: string;
  originalName: string;
  originalType?: string;
  description?: string;
  balance?: number;
  businessType: string;
  existingAccounts?: Array<{code: string; name: string; type: string}>;
}

interface AccountMappingResponse {
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
               'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  description: string;
  confidence: number;
  reasoning: string;
  aiEnhanced: boolean;
}

interface AccountGenerationRequest {
  businessType: string;
  businessDescription: string;
  specificNeeds: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
  existingAccounts?: Array<{code: string; name: string; type: string}>;
}

export class ClaudeAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';
  
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Claude API key not found. AI smart path will be disabled.');
    }
  }

  /**
   * Check if Claude API is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Call Claude API with proper error handling
   */
  private async callClaude(messages: ClaudeMessage[]): Promise<ClaudeResponse | null> {
    if (!this.apiKey) {
      console.warn('⚠️ Claude API key not available');
      return null;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          temperature: 0.1, // Low temperature for consistent financial mapping
          messages: messages
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Claude API error:', response.status, error);
        return null;
      }

      const result: ClaudeResponse = await response.json();
      console.log('✅ Claude API success:', {
        inputTokens: result.usage?.input_tokens,
        outputTokens: result.usage?.output_tokens
      });

      return result;
    } catch (error) {
      console.error('❌ Claude API call failed:', error);
      return null;
    }
  }

  /**
   * Map a single account using Claude AI (smart path)
   */
  async mapAccount(request: AccountMappingRequest): Promise<AccountMappingResponse | null> {
    if (!this.isAvailable()) {
      return null;
    }

    console.log('🧠 Claude AI: Mapping complex account:', request.originalName);

    const existingAccountsContext = request.existingAccounts?.length 
      ? `\n\nExisting accounts in this organization:\n${request.existingAccounts.map(acc => `${acc.code}: ${acc.name} (${acc.type})`).join('\n')}`
      : '';

    const prompt = `You are a professional accountant helping to map legacy chart of accounts to HERA's standardized system.

HERA Account Categories & Ranges:
- ASSET (1000000-1999999): Cash, A/R, Inventory, Equipment, etc.
- LIABILITY (2000000-2999999): A/P, Loans, Accrued expenses, etc.  
- EQUITY (3000000-3999999): Owner's equity, retained earnings, etc.
- REVENUE (4000000-4999999): Sales, service income, etc.
- COST_OF_SALES (5000000-5999999): Direct costs, COGS, etc.
- DIRECT_EXPENSE (6000000-6999999): Labor, supplies directly tied to operations
- INDIRECT_EXPENSE (7000000-7999999): Rent, utilities, admin expenses
- TAX_EXPENSE (8000000-8999999): Income tax, payroll tax, etc.
- EXTRAORDINARY_EXPENSE (9000000-9999999): One-time, unusual expenses

Business Context: ${request.businessType}

Legacy Account to Map:
- Code: ${request.originalCode}
- Name: ${request.originalName}
- Type: ${request.originalType || 'Not specified'}
- Description: ${request.description || 'Not provided'}
- Balance: ${request.balance ? '$' + request.balance.toLocaleString() : 'Not provided'}${existingAccountsContext}

Please analyze this account and provide a mapping recommendation in JSON format:
{
  "accountCode": "NNNNNNN", 
  "accountName": "Improved account name following HERA standards",
  "accountType": "ONE_OF_THE_9_CATEGORIES",
  "description": "Clear description of what this account tracks",
  "confidence": 0.XX,
  "reasoning": "Explanation of why this mapping makes sense"
}

Consider:
1. The account's purpose and what it tracks
2. Industry-specific context (${request.businessType})
3. HERA's 7-digit numbering system
4. Avoid duplicating existing accounts
5. Follow accounting best practices

Respond with ONLY the JSON object, no additional text.`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.callClaude(messages);
    if (!response) {
      return null;
    }

    try {
      const content = response.content[0]?.text;
      const parsed = JSON.parse(content);
      
      // Validate the response
      if (!parsed.accountCode || !parsed.accountName || !parsed.accountType) {
        console.error('❌ Invalid Claude response structure:', parsed);
        return null;
      }

      return {
        ...parsed,
        aiEnhanced: true
      };
    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error);
      return null;
    }
  }

  /**
   * Generate accounts using Claude AI (smart path)
   */
  async generateAccounts(request: AccountGenerationRequest): Promise<AccountMappingResponse[]> {
    if (!this.isAvailable()) {
      return [];
    }

    console.log('🧠 Claude AI: Generating accounts for:', request.businessType);

    const existingAccountsContext = request.existingAccounts?.length 
      ? `\n\nExisting accounts (do NOT duplicate these):\n${request.existingAccounts.map(acc => `${acc.code}: ${acc.name}`).join('\n')}`
      : '';

    const prompt = `You are a professional accountant creating a chart of accounts for a business.

Business Details:
- Type: ${request.businessType}
- Description: ${request.businessDescription}
- Specific Needs: ${request.specificNeeds.join(', ')}
- Complexity Level: ${request.complexity}${existingAccountsContext}

HERA Account System:
- Use 7-digit codes with proper ranges
- ASSET (1000000+), LIABILITY (2000000+), EQUITY (3000000+), REVENUE (4000000+)
- COST_OF_SALES (5000000+), DIRECT_EXPENSE (6000000+), INDIRECT_EXPENSE (7000000+)
- TAX_EXPENSE (8000000+), EXTRAORDINARY_EXPENSE (9000000+)

Generate ${request.complexity === 'basic' ? '15-20' : request.complexity === 'intermediate' ? '20-30' : '30-40'} accounts specifically needed for this business.

Requirements:
1. Focus on accounts this specific business actually needs
2. Consider industry-specific requirements
3. Include accounts for the specific needs mentioned
4. Use proper HERA 7-digit codes (avoid duplicates with existing accounts)
5. Provide practical account names and descriptions
6. Assign confidence levels based on how essential each account is

Return a JSON array of accounts:
[
  {
    "accountCode": "NNNNNNN",
    "accountName": "Specific account name", 
    "accountType": "CATEGORY",
    "description": "What this account tracks",
    "confidence": 0.XX,
    "reasoning": "Why this account is needed for this business"
  }
]

Respond with ONLY the JSON array, no additional text.`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.callClaude(messages);
    if (!response) {
      return [];
    }

    try {
      const content = response.content[0]?.text;
      const parsed = JSON.parse(content);
      
      if (!Array.isArray(parsed)) {
        console.error('❌ Claude response not an array:', parsed);
        return [];
      }

      return parsed.map((account: any) => ({
        ...account,
        aiEnhanced: true
      }));
    } catch (error) {
      console.error('❌ Failed to parse Claude accounts response:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive COA template using Claude AI
   */
  async generateTemplate(prompt: string): Promise<{accounts: any[]} | null> {
    if (!this.isAvailable()) {
      return null;
    }

    console.log('🧠 Claude AI: Generating comprehensive COA template');

    const messages: ClaudeMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.callClaude(messages);
    if (!response) {
      return null;
    }

    try {
      const content = response.content[0]?.text;
      const parsed = JSON.parse(content);
      
      if (!parsed.accounts || !Array.isArray(parsed.accounts)) {
        console.error('❌ Invalid template response structure:', parsed);
        return null;
      }

      // Validate that accounts have required fields
      const validAccounts = parsed.accounts.filter((account: any) => 
        account.accountCode && account.accountName && account.accountType
      );

      console.log('✅ Generated template with', validAccounts.length, 'valid accounts');
      
      return { accounts: validAccounts };
    } catch (error) {
      console.error('❌ Failed to parse Claude template response:', error);
      return null;
    }
  }

  /**
   * Analyze account conflicts and suggest resolutions
   */
  async resolveAccountConflicts(conflicts: Array<{
    existing: {code: string; name: string; type: string};
    new: {code: string; name: string; type: string};
    issue: string;
  }>): Promise<Array<{
    originalConflict: any;
    resolution: 'rename' | 'merge' | 'skip' | 'create_new';
    suggestedCode?: string;
    suggestedName?: string;
    reasoning: string;
  }>> {
    if (!this.isAvailable() || conflicts.length === 0) {
      return [];
    }

    console.log('🧠 Claude AI: Resolving', conflicts.length, 'account conflicts');

    const prompt = `You are resolving chart of accounts conflicts during migration.

Conflicts to resolve:
${conflicts.map((c, i) => `
${i + 1}. CONFLICT: ${c.issue}
   Existing: ${c.existing.code} - ${c.existing.name} (${c.existing.type})
   New: ${c.new.code} - ${c.new.name} (${c.new.type})
`).join('')}

For each conflict, recommend the best resolution:
- "rename": Change the new account's code/name to avoid conflict
- "merge": The accounts are essentially the same, merge them
- "skip": Don't import the new account (existing is sufficient)
- "create_new": Create with a different code (if both are needed)

Respond with JSON array:
[
  {
    "conflictIndex": 0,
    "resolution": "rename|merge|skip|create_new",
    "suggestedCode": "NNNNNNN", 
    "suggestedName": "Alternative name if needed",
    "reasoning": "Why this resolution makes sense"
  }
]

Respond with ONLY the JSON array.`;

    const messages: ClaudeMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.callClaude(messages);
    if (!response) {
      return [];
    }

    try {
      const content = response.content[0]?.text;
      const parsed = JSON.parse(content);
      
      return parsed.map((resolution: any, index: number) => ({
        originalConflict: conflicts[resolution.conflictIndex || index],
        resolution: resolution.resolution,
        suggestedCode: resolution.suggestedCode,
        suggestedName: resolution.suggestedName,
        reasoning: resolution.reasoning
      }));
    } catch (error) {
      console.error('❌ Failed to parse Claude conflicts response:', error);
      return [];
    }
  }
}

// Export singleton instance
export const claudeAI = new ClaudeAIService();