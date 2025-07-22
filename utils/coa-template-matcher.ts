/**
 * HERA COA Template Matcher
 * 
 * Intelligent matching engine for legacy accounts against Claude-generated templates
 * Uses fuzzy search, keywords, aliases, and AI similarity scoring
 */

import { claudeAI } from './claude-ai-service';

interface TemplateAccount {
  accountCode: string;
  accountName: string;
  accountType: string;
  description: string;
  keywords: string[];
  commonAliases: string[];
  aiMetadata: {
    confidence: number;
    usageFrequency: string;
    criticalAccount: boolean;
    priority: string;
  };
}

interface LoadedTemplate {
  templateId: string;
  businessType: string;
  accounts: TemplateAccount[];
  searchIndex: SearchIndex;
}

interface SearchIndex {
  nameIndex: Map<string, TemplateAccount[]>;
  keywordIndex: Map<string, TemplateAccount[]>;
  aliasIndex: Map<string, TemplateAccount[]>;
  typeIndex: Map<string, TemplateAccount[]>;
}

interface TemplateMatch {
  account: TemplateAccount;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'keyword' | 'alias' | 'ai_similarity';
  reasoning: string;
  score: number;
}

interface MatchRequest {
  name: string;
  type?: string;
  description?: string;
  originalCode?: string;
}

/**
 * Calculates Levenshtein distance between two strings
 * Used for fuzzy matching of account names
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize the matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculates similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Normalizes text for comparison (lowercase, remove special chars, etc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts keywords from account name for matching
 */
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  // Filter out common words
  const stopWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return words
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 5); // Take top 5 keywords
}

export class COATemplateMatcher {
  private template: LoadedTemplate | null = null;

  /**
   * Load template and build search indices
   */
  async loadTemplate(template: {
    templateId: string;
    businessType: string;
    accounts: TemplateAccount[];
  }): Promise<void> {
    console.log('📚 Loading COA template for matching:', template.templateId);
    
    const searchIndex = this.buildSearchIndex(template.accounts);
    
    this.template = {
      ...template,
      searchIndex
    };
    
    console.log('✅ Template loaded with', template.accounts.length, 'accounts');
  }

  /**
   * Build search indices for fast lookup
   */
  private buildSearchIndex(accounts: TemplateAccount[]): SearchIndex {
    const nameIndex = new Map<string, TemplateAccount[]>();
    const keywordIndex = new Map<string, TemplateAccount[]>();
    const aliasIndex = new Map<string, TemplateAccount[]>();
    const typeIndex = new Map<string, TemplateAccount[]>();

    accounts.forEach(account => {
      // Index by normalized name
      const normalizedName = normalizeText(account.accountName);
      if (!nameIndex.has(normalizedName)) {
        nameIndex.set(normalizedName, []);
      }
      nameIndex.get(normalizedName)!.push(account);

      // Index by keywords
      account.keywords.forEach(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        if (!keywordIndex.has(normalizedKeyword)) {
          keywordIndex.set(normalizedKeyword, []);
        }
        keywordIndex.get(normalizedKeyword)!.push(account);
      });

      // Index by aliases
      account.commonAliases.forEach(alias => {
        const normalizedAlias = normalizeText(alias);
        if (!aliasIndex.has(normalizedAlias)) {
          aliasIndex.set(normalizedAlias, []);
        }
        aliasIndex.get(normalizedAlias)!.push(account);
      });

      // Index by type
      if (!typeIndex.has(account.accountType)) {
        typeIndex.set(account.accountType, []);
      }
      typeIndex.get(account.accountType)!.push(account);
    });

    return { nameIndex, keywordIndex, aliasIndex, typeIndex };
  }

  /**
   * Find exact matches by name
   */
  private findExactMatches(input: string): TemplateMatch[] {
    if (!this.template) return [];

    const normalizedInput = normalizeText(input);
    const exactMatches = this.template.searchIndex.nameIndex.get(normalizedInput) || [];
    
    return exactMatches.map(account => ({
      account,
      confidence: 1.0,
      matchType: 'exact' as const,
      reasoning: 'Exact name match with template account',
      score: 100
    }));
  }

  /**
   * Find fuzzy matches by name similarity
   */
  private findFuzzyMatches(input: string): TemplateMatch[] {
    if (!this.template) return [];

    const normalizedInput = normalizeText(input);
    const matches: TemplateMatch[] = [];

    this.template.accounts.forEach(account => {
      const normalizedName = normalizeText(account.accountName);
      const similarity = calculateSimilarity(normalizedInput, normalizedName);
      
      if (similarity > 0.7) { // 70% similarity threshold
        matches.push({
          account,
          confidence: similarity,
          matchType: 'fuzzy',
          reasoning: `${Math.round(similarity * 100)}% name similarity: "${account.accountName}"`,
          score: similarity * 80 // Max 80 points for fuzzy match
        });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find matches by keywords
   */
  private findKeywordMatches(input: string): TemplateMatch[] {
    if (!this.template) return [];

    const inputKeywords = extractKeywords(input);
    const matches = new Map<string, TemplateMatch>(); // Deduplicate by account code

    inputKeywords.forEach(keyword => {
      const keywordMatches = this.template!.searchIndex.keywordIndex.get(keyword) || [];
      
      keywordMatches.forEach(account => {
        const existing = matches.get(account.accountCode);
        const score = 60; // Base score for keyword match
        
        if (existing) {
          // Boost score for multiple keyword matches
          existing.score += 10;
          existing.reasoning += `, "${keyword}"`;
        } else {
          matches.set(account.accountCode, {
            account,
            confidence: 0.8,
            matchType: 'keyword',
            reasoning: `Keyword match: "${keyword}"`,
            score
          });
        }
      });
    });

    return Array.from(matches.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Find matches by aliases
   */
  private findAliasMatches(input: string): TemplateMatch[] {
    if (!this.template) return [];

    const normalizedInput = normalizeText(input);
    const matches: TemplateMatch[] = [];

    // Check exact alias matches
    const exactAliasMatches = this.template.searchIndex.aliasIndex.get(normalizedInput) || [];
    
    exactAliasMatches.forEach(account => {
      const matchingAlias = account.commonAliases.find(alias => 
        normalizeText(alias) === normalizedInput
      );
      
      matches.push({
        account,
        confidence: 0.95,
        matchType: 'alias',
        reasoning: `Exact alias match: "${matchingAlias}"`,
        score: 90
      });
    });

    // Check fuzzy alias matches
    this.template.accounts.forEach(account => {
      account.commonAliases.forEach(alias => {
        const similarity = calculateSimilarity(normalizedInput, normalizeText(alias));
        
        if (similarity > 0.8) {
          matches.push({
            account,
            confidence: similarity * 0.9, // Slightly lower than exact
            matchType: 'alias',
            reasoning: `${Math.round(similarity * 100)}% alias similarity: "${alias}"`,
            score: similarity * 85
          });
        }
      });
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find matches using AI similarity (most expensive, used sparingly)
   */
  private async findAISimilarityMatches(request: MatchRequest): Promise<TemplateMatch[]> {
    if (!this.template || !claudeAI.isAvailable()) {
      return [];
    }

    try {
      console.log('🧠 Using AI similarity matching for:', request.name);

      // Get top 10 accounts from template by priority/frequency
      const candidateAccounts = this.template.accounts
        .filter(acc => acc.aiMetadata.priority === 'essential' || acc.aiMetadata.usageFrequency === 'very_high')
        .slice(0, 10);

      // Use Claude to find semantic similarity
      const prompt = `You are helping to find the best matching account from a chart of accounts template.

Legacy Account to Match:
- Name: ${request.name}
- Type: ${request.type || 'Not specified'}
- Description: ${request.description || 'Not provided'}

Template Accounts to Consider:
${candidateAccounts.map((acc, i) => `${i + 1}. ${acc.accountCode} - ${acc.accountName} (${acc.accountType})
   Description: ${acc.description}
   Keywords: ${acc.keywords.join(', ')}`).join('\n')}

Find the best semantic match and respond with JSON:
{
  "bestMatch": 1-10 or null if no good match,
  "confidence": 0.0-1.0,
  "reasoning": "Why this is or isn't a good match"
}

Consider the business purpose, not just name similarity.`;

      const messages = [{ role: 'user' as const, content: prompt }];
      
      // Simplified AI call (you may need to adjust based on your AI service structure)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          temperature: 0.1,
          messages
        })
      });

      if (response.ok) {
        const aiResult = await response.json();
        const content = aiResult.content[0]?.text;
        const parsed = JSON.parse(content);
        
        if (parsed.bestMatch && parsed.bestMatch > 0) {
          const matchedAccount = candidateAccounts[parsed.bestMatch - 1];
          
          return [{
            account: matchedAccount,
            confidence: parsed.confidence,
            matchType: 'ai_similarity',
            reasoning: `AI semantic match: ${parsed.reasoning}`,
            score: parsed.confidence * 100
          }];
        }
      }
    } catch (error) {
      console.error('❌ AI similarity matching failed:', error);
    }

    return [];
  }

  /**
   * Main matching function - combines all strategies
   */
  async matchAccount(request: MatchRequest): Promise<TemplateMatch[]> {
    if (!this.template) {
      throw new Error('Template not loaded. Call loadTemplate() first.');
    }

    console.log('🔍 Matching account against template:', request.name);

    const allMatches: TemplateMatch[] = [];

    // 1. Exact matches (highest priority)
    const exactMatches = this.findExactMatches(request.name);
    allMatches.push(...exactMatches);

    // 2. Alias matches (high priority)
    const aliasMatches = this.findAliasMatches(request.name);
    allMatches.push(...aliasMatches);

    // 3. Fuzzy matches (medium priority)
    const fuzzyMatches = this.findFuzzyMatches(request.name);
    allMatches.push(...fuzzyMatches);

    // 4. Keyword matches (medium priority)
    const keywordMatches = this.findKeywordMatches(request.name);
    allMatches.push(...keywordMatches);

    // 5. AI similarity matches (for complex cases)
    if (allMatches.length === 0 || allMatches[0].confidence < 0.75) {
      const aiMatches = await this.findAISimilarityMatches(request);
      allMatches.push(...aiMatches);
    }

    // Remove duplicates and rank results
    const deduped = this.rankAndDeduplicateMatches(allMatches);
    
    console.log(`✅ Found ${deduped.length} matches for "${request.name}"`);
    
    return deduped.slice(0, 5); // Return top 5 matches
  }

  /**
   * Remove duplicates and rank matches by combined score and confidence
   */
  private rankAndDeduplicateMatches(matches: TemplateMatch[]): TemplateMatch[] {
    const uniqueMatches = new Map<string, TemplateMatch>();

    matches.forEach(match => {
      const existing = uniqueMatches.get(match.account.accountCode);
      
      if (!existing || match.score > existing.score) {
        // Use the best match for each account
        uniqueMatches.set(match.account.accountCode, match);
      }
    });

    return Array.from(uniqueMatches.values())
      .sort((a, b) => {
        // Sort by score first, then by confidence
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.confidence - a.confidence;
      });
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): any {
    if (!this.template) {
      return null;
    }

    const stats = {
      totalAccounts: this.template.accounts.length,
      categories: {} as Record<string, number>,
      priorities: { essential: 0, recommended: 0, optional: 0 },
      averageConfidence: 0
    };

    let totalConfidence = 0;

    this.template.accounts.forEach(account => {
      // Count by category
      stats.categories[account.accountType] = (stats.categories[account.accountType] || 0) + 1;
      
      // Count by priority
      const priority = account.aiMetadata.priority as keyof typeof stats.priorities;
      if (priority in stats.priorities) {
        stats.priorities[priority]++;
      }
      
      // Sum confidence
      totalConfidence += account.aiMetadata.confidence;
    });

    stats.averageConfidence = totalConfidence / this.template.accounts.length;

    return stats;
  }
}

// Export utility functions for testing
export const templateMatcherUtils = {
  normalizeText,
  calculateSimilarity,
  extractKeywords,
  levenshteinDistance
};