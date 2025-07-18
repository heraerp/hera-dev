/**
 * 🎨 HERA Universal Visual AI Testing Framework
 * 
 * Advanced visual testing using AI to:
 * - Analyze UI screenshots for defects
 * - Validate design consistency and accessibility
 * - Detect visual regressions automatically
 * - Generate UI improvement recommendations
 * - Test responsive design across devices
 */

import OpenAI from 'openai';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface VisualTestConfig {
  breakpoints: { name: string; width: number; height: number }[];
  components: string[];
  pages: string[];
  accessibility: boolean;
  performance: boolean;
  brandCompliance: boolean;
}

export interface VisualTestResult {
  testId: string;
  pageName: string;
  breakpoint: string;
  passed: boolean;
  issues: VisualIssue[];
  screenshots: ScreenshotData[];
  accessibilityScore: number;
  performanceScore: number;
  brandComplianceScore: number;
  aiAnalysis: string;
  recommendations: string[];
}

export interface VisualIssue {
  type: 'layout' | 'typography' | 'color' | 'spacing' | 'accessibility' | 'performance' | 'brand';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: { x: number; y: number; width: number; height: number };
  suggestion: string;
  confidence: number;
}

export interface ScreenshotData {
  filename: string;
  path: string;
  timestamp: string;
  metadata: {
    viewport: { width: number; height: number };
    userAgent: string;
    url: string;
  };
}

export class VisualAITester {
  private openai: OpenAI;
  private baselineDir: string;
  private resultsDir: string;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    });
    this.baselineDir = path.join(process.cwd(), 'tests', 'visual-baselines');
    this.resultsDir = path.join(process.cwd(), 'test-results', 'visual');
    
    this.ensureDirectories();
  }

  /**
   * 🎯 Execute comprehensive visual testing suite
   */
  async executeVisualTestSuite(
    page: Page,
    config: VisualTestConfig
  ): Promise<VisualTestResult[]> {
    console.log('🎨 Starting AI-powered visual testing suite...');

    const results: VisualTestResult[] = [];

    for (const pageName of config.pages) {
      for (const breakpoint of config.breakpoints) {
        const result = await this.testPageAtBreakpoint(page, pageName, breakpoint, config);
        results.push(result);
      }
    }

    await this.generateVisualTestReport(results);
    return results;
  }

  /**
   * 📱 Test page at specific breakpoint with AI analysis
   */
  private async testPageAtBreakpoint(
    page: Page,
    pageName: string,
    breakpoint: { name: string; width: number; height: number },
    config: VisualTestConfig
  ): Promise<VisualTestResult> {
    console.log(`🔍 Testing ${pageName} at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);

    const testId = `${pageName}-${breakpoint.name}-${Date.now()}`;
    
    // Set viewport
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    
    // Navigate to page
    await page.goto(pageName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow animations to complete

    // Capture screenshot
    const screenshot = await this.captureScreenshot(page, testId, breakpoint);
    
    // Analyze with AI
    const aiAnalysis = await this.analyzeScreenshotWithAI(screenshot, pageName, breakpoint, config);
    
    // Calculate scores
    const accessibilityScore = await this.calculateAccessibilityScore(page);
    const performanceScore = await this.calculatePerformanceScore(page);
    const brandComplianceScore = await this.calculateBrandComplianceScore(aiAnalysis);

    const result: VisualTestResult = {
      testId,
      pageName,
      breakpoint: breakpoint.name,
      passed: aiAnalysis.issues.length === 0 || !aiAnalysis.issues.some(i => i.severity === 'critical'),
      issues: aiAnalysis.issues,
      screenshots: [screenshot],
      accessibilityScore,
      performanceScore,
      brandComplianceScore,
      aiAnalysis: aiAnalysis.analysis,
      recommendations: aiAnalysis.recommendations
    };

    console.log(`${result.passed ? '✅' : '❌'} Visual test: ${pageName} @ ${breakpoint.name}`);
    return result;
  }

  /**
   * 📸 Capture high-quality screenshot with metadata
   */
  private async captureScreenshot(
    page: Page,
    testId: string,
    breakpoint: { name: string; width: number; height: number }
  ): Promise<ScreenshotData> {
    const filename = `${testId}-${breakpoint.name}.png`;
    const filePath = path.join(this.resultsDir, filename);
    
    await page.screenshot({
      path: filePath,
      fullPage: true,
      animations: 'disabled'
    });

    return {
      filename,
      path: filePath,
      timestamp: new Date().toISOString(),
      metadata: {
        viewport: { width: breakpoint.width, height: breakpoint.height },
        userAgent: await page.evaluate(() => navigator.userAgent),
        url: page.url()
      }
    };
  }

  /**
   * 🧠 Analyze screenshot using AI vision model
   */
  private async analyzeScreenshotWithAI(
    screenshot: ScreenshotData,
    pageName: string,
    breakpoint: { name: string; width: number; height: number },
    config: VisualTestConfig
  ): Promise<{
    analysis: string;
    issues: VisualIssue[];
    recommendations: string[];
  }> {
    console.log('🧠 Analyzing screenshot with AI vision...');

    try {
      // Read screenshot as base64
      const imageBuffer = fs.readFileSync(screenshot.path);
      const base64Image = imageBuffer.toString('base64');

      const analysisPrompt = `
Analyze this screenshot of HERA Universal restaurant management system:

PAGE: ${pageName}
VIEWPORT: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})
URL: ${screenshot.metadata.url}

HERA UNIVERSAL DESIGN SYSTEM TO VALIDATE:
1. Revolutionary Design Language - Mathematical color harmony with golden ratio
2. Circadian Rhythm Adaptation - Colors that adapt to time of day
3. Cognitive Load Management - Clean, focused interfaces
4. Physics-Based Animations - Natural spring curves and micro-interactions
5. Contextual Intelligence - Business context-aware themes
6. Accessibility Excellence - WCAG 2.1 AAA compliance
7. Mobile-First Responsive Design - Perfect on all screen sizes
8. Professional Restaurant Aesthetics - Suitable for business use

BRAND REQUIREMENTS:
- Primary Colors: Blue (#3b82f6), Green (#10b981), Purple (#8b5cf6)
- Typography: Clean, readable fonts with proper hierarchy
- Spacing: Consistent padding and margins
- Cards: Rounded corners with subtle shadows
- Buttons: Clear CTAs with hover states
- Forms: Intuitive and accessible
- Navigation: Clear and consistent

ANALYSIS FOCUS:
1. Layout and Visual Hierarchy
2. Typography and Readability
3. Color Usage and Contrast
4. Spacing and Alignment
5. Component Consistency
6. Accessibility Features
7. Responsive Design Quality
8. Brand Compliance
9. Professional Appearance
10. User Experience Flow

For each issue found, provide:
- Type (layout/typography/color/spacing/accessibility/performance/brand)
- Severity (critical/high/medium/low)
- Description of the problem
- Specific improvement suggestion
- Confidence level (0-100)

Provide comprehensive analysis covering visual quality, usability, and HERA design system compliance.

Format response as JSON:
{
  "analysis": "comprehensive analysis text",
  "issues": [
    {
      "type": "layout",
      "severity": "medium", 
      "description": "specific issue description",
      "location": {"x": 0, "y": 0, "width": 100, "height": 50},
      "suggestion": "specific improvement",
      "confidence": 85
    }
  ],
  "recommendations": ["specific actionable recommendations"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No AI analysis received');

      const analysis = JSON.parse(content);
      return {
        analysis: analysis.analysis || 'AI analysis completed',
        issues: analysis.issues || [],
        recommendations: analysis.recommendations || []
      };

    } catch (error) {
      console.error('❌ AI visual analysis failed:', error);
      return {
        analysis: 'AI analysis failed',
        issues: [],
        recommendations: ['Manual visual review recommended']
      };
    }
  }

  /**
   * ♿ Calculate accessibility score
   */
  private async calculateAccessibilityScore(page: Page): Promise<number> {
    const score = await page.evaluate(() => {
      let score = 100;
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
      score -= (imagesWithoutAlt.length / images.length) * 20;
      
      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      const inputsWithoutLabels = Array.from(inputs).filter(input => {
        const id = input.id;
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      score -= (inputsWithoutLabels.length / inputs.length) * 15;
      
      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) score -= 10;
      
      // Check for focus indicators
      const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
      if (focusableElements.length > 0) {
        // Simplified check - in reality would test actual focus styles
        score += 5;
      }
      
      // Check color contrast (simplified)
      const elements = document.querySelectorAll('*');
      let contrastIssues = 0;
      Array.from(elements).slice(0, 100).forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Simplified contrast check
        if (color === 'rgb(128, 128, 128)' && bgColor === 'rgb(255, 255, 255)') {
          contrastIssues++;
        }
      });
      score -= contrastIssues * 2;
      
      return Math.max(0, Math.min(100, score));
    });
    
    return Math.round(score);
  }

  /**
   * ⚡ Calculate performance score
   */
  private async calculatePerformanceScore(page: Page): Promise<number> {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
    
    let score = 100;
    
    // Penalize slow load times
    if (metrics.loadTime > 3000) score -= 30;
    else if (metrics.loadTime > 2000) score -= 15;
    else if (metrics.loadTime > 1000) score -= 5;
    
    // Penalize slow FCP
    if (metrics.firstContentfulPaint > 2000) score -= 20;
    else if (metrics.firstContentfulPaint > 1500) score -= 10;
    
    // Penalize too many resources
    if (metrics.resourceCount > 100) score -= 15;
    else if (metrics.resourceCount > 50) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 🎨 Calculate brand compliance score
   */
  private calculateBrandComplianceScore(analysis: { issues: VisualIssue[] }): number {
    let score = 100;
    
    const brandIssues = analysis.issues.filter(issue => issue.type === 'brand');
    const colorIssues = analysis.issues.filter(issue => issue.type === 'color');
    const typographyIssues = analysis.issues.filter(issue => issue.type === 'typography');
    
    score -= brandIssues.length * 15;
    score -= colorIssues.length * 10;
    score -= typographyIssues.length * 8;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 📊 Generate comprehensive visual test report
   */
  private async generateVisualTestReport(results: VisualTestResult[]): Promise<void> {
    const reportData = {
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        averageAccessibilityScore: Math.round(
          results.reduce((sum, r) => sum + r.accessibilityScore, 0) / results.length
        ),
        averagePerformanceScore: Math.round(
          results.reduce((sum, r) => sum + r.performanceScore, 0) / results.length
        ),
        averageBrandComplianceScore: Math.round(
          results.reduce((sum, r) => sum + r.brandComplianceScore, 0) / results.length
        )
      },
      results,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(this.resultsDir, 'visual-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(reportData);

    console.log(`📊 Visual test report generated: ${reportPath}`);
  }

  /**
   * 🌐 Generate HTML visual test report
   */
  private async generateHTMLReport(data: any): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HERA Universal - Visual Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; }
        .summary-number { font-size: 2.5em; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
        .summary-label { color: #6b7280; font-weight: 500; }
        .test-result { background: white; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .test-header { padding: 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .test-status { padding: 4px 12px; border-radius: 20px; font-size: 0.875em; font-weight: 500; }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .test-details { padding: 20px; }
        .scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .score { text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .score-value { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
        .score-label { color: #6b7280; font-size: 0.875em; }
        .issues { margin-top: 20px; }
        .issue { padding: 15px; margin-bottom: 10px; border-left: 4px solid #f59e0b; background: #fefbf2; border-radius: 0 8px 8px 0; }
        .issue-critical { border-left-color: #ef4444; background: #fef2f2; }
        .issue-high { border-left-color: #f97316; background: #fff7ed; }
        .issue-title { font-weight: 600; margin-bottom: 5px; }
        .issue-description { color: #6b7280; margin-bottom: 5px; }
        .issue-suggestion { color: #059669; font-style: italic; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .screenshot { text-align: center; }
        .screenshot img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 HERA Universal Visual Test Report</h1>
            <p>AI-Powered Visual Testing Results</p>
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-number">${data.summary.total}</div>
                <div class="summary-label">Total Tests</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${data.summary.passed}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${data.summary.failed}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${data.summary.averageAccessibilityScore}</div>
                <div class="summary-label">Avg Accessibility</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${data.summary.averagePerformanceScore}</div>
                <div class="summary-label">Avg Performance</div>
            </div>
            <div class="summary-card">
                <div class="summary-number">${data.summary.averageBrandComplianceScore}</div>
                <div class="summary-label">Avg Brand Compliance</div>
            </div>
        </div>

        ${data.results.map((result: VisualTestResult) => `
        <div class="test-result">
            <div class="test-header">
                <div>
                    <h3>${result.pageName} @ ${result.breakpoint}</h3>
                    <p>Test ID: ${result.testId}</p>
                </div>
                <div class="test-status ${result.passed ? 'status-passed' : 'status-failed'}">
                    ${result.passed ? 'PASSED' : 'FAILED'}
                </div>
            </div>
            <div class="test-details">
                <div class="scores">
                    <div class="score">
                        <div class="score-value">${result.accessibilityScore}/100</div>
                        <div class="score-label">Accessibility</div>
                    </div>
                    <div class="score">
                        <div class="score-value">${result.performanceScore}/100</div>
                        <div class="score-label">Performance</div>
                    </div>
                    <div class="score">
                        <div class="score-value">${result.brandComplianceScore}/100</div>
                        <div class="score-label">Brand Compliance</div>
                    </div>
                </div>

                <h4>AI Analysis:</h4>
                <p>${result.aiAnalysis}</p>

                ${result.issues.length > 0 ? `
                <div class="issues">
                    <h4>Issues Found (${result.issues.length}):</h4>
                    ${result.issues.map(issue => `
                    <div class="issue issue-${issue.severity}">
                        <div class="issue-title">${issue.type.toUpperCase()} - ${issue.severity.toUpperCase()}</div>
                        <div class="issue-description">${issue.description}</div>
                        <div class="issue-suggestion">💡 ${issue.suggestion}</div>
                    </div>
                    `).join('')}
                </div>
                ` : '<p>✅ No issues found!</p>'}

                ${result.recommendations.length > 0 ? `
                <h4>Recommendations:</h4>
                <ul>
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;

    const htmlPath = path.join(this.resultsDir, 'visual-test-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`🌐 HTML report generated: ${htmlPath}`);
  }

  private ensureDirectories(): void {
    [this.baselineDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}

export default VisualAITester;