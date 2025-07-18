import { test, expect } from '@playwright/test';

/**
 * 🧠 HERA Universal - "Don't Make Me Think" UX Analysis
 * 
 * Analyzes HERA's user experience against Steve Krug's principles:
 * 1. Clear next steps at every stage
 * 2. Smooth transitions between actions
 * 3. Obvious choices and pathways
 * 4. Minimal cognitive load
 * 5. Self-evident functionality
 */

test('🧠 HERA UX Analysis - "Don\'t Make Me Think" Principles', async ({ page }) => {
  console.log('🧠 Starting "Don\'t Make Me Think" UX Analysis...');
  
  const uxIssues: string[] = [];
  const uxStrengths: string[] = [];
  const improvementSuggestions: string[] = [];
  
  // Track user journey and friction points
  let currentStep = 1;
  const userJourney: any[] = [];

  // ANALYSIS 1: Restaurant Setup Flow
  console.log('\n📋 ANALYSIS 1: Restaurant Setup Flow');
  console.log('====================================');
  
  await page.goto('/setup/restaurant');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/ux-analysis-01-setup-landing.png', fullPage: true });
  
  // Check for clear value proposition
  const hasValueProp = await page.locator('text=HERA Universal, text=2-minute, text=Revolutionary').count() > 0;
  const hasStepIndicator = await page.locator('text=Step 1 of 4').count() > 0;
  const hasNextStepPreview = await page.locator('text=Next:, text=Coming up:, text=After this:').count() > 0;
  const hasTimeEstimate = await page.locator('text=minutes, text=takes, text=estimated').count() > 0;
  const hasHelpText = await page.locator('text=Why, text=Help, text=Learn more').count() > 0;
  
  console.log(`📊 Value proposition visible: ${hasValueProp}`);
  console.log(`📊 Step indicator present: ${hasStepIndicator}`);
  console.log(`📊 Next step preview: ${hasNextStepPreview}`);
  console.log(`📊 Time estimate shown: ${hasTimeEstimate}`);
  console.log(`📊 Help text available: ${hasHelpText}`);
  
  userJourney.push({
    step: currentStep++,
    page: 'Setup Landing',
    clarity: hasStepIndicator ? 'Good' : 'Poor',
    guidance: hasNextStepPreview ? 'Good' : 'Missing',
    issues: !hasNextStepPreview ? ['No preview of what comes next'] : []
  });
  
  if (hasStepIndicator) {
    uxStrengths.push('Clear step progression (Step 1 of 4)');
  } else {
    uxIssues.push('Missing step progression indicator');
  }
  
  if (!hasNextStepPreview) {
    uxIssues.push('No preview of what comes after current step');
    improvementSuggestions.push('Add "Next: Location Details" preview');
  }
  
  if (!hasTimeEstimate) {
    uxIssues.push('No time estimate for completion');
    improvementSuggestions.push('Add "Takes 2 minutes" estimate');
  }

  // Test form field clarity
  const businessNameField = page.locator('#businessName');
  const hasPlaceholder = await businessNameField.getAttribute('placeholder');
  const hasLabel = await page.locator('label[for="businessName"]').count() > 0;
  const hasRequiredIndicator = await page.locator('text=*').count() > 0;
  
  console.log(`📊 Field has placeholder: ${!!hasPlaceholder}`);
  console.log(`📊 Field has label: ${hasLabel}`);
  console.log(`📊 Required fields marked: ${hasRequiredIndicator}`);
  
  if (hasPlaceholder && hasLabel) {
    uxStrengths.push('Clear form field guidance with examples');
  } else {
    uxIssues.push('Form fields lack clear guidance');
  }

  // ANALYSIS 2: Post-Setup Experience  
  console.log('\n🏠 ANALYSIS 2: Post-Setup Dashboard Experience');
  console.log('==============================================');
  
  await page.goto('/restaurant');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/ux-analysis-02-dashboard.png', fullPage: true });
  
  // Check for onboarding guidance
  const hasWelcomeMessage = await page.locator('text=Welcome, text=Getting started, text=First time').count() > 0;
  const hasQuickActions = await page.locator('text=Quick start, text=Get started, text=First steps').count() > 0;
  const hasFeatureCards = await page.locator('[data-testid="feature-card"], .feature-card').count() > 0 || 
                          await page.locator('text=Product Catalog, text=Order Processing').count() > 0;
  const hasPriorityGuidance = await page.locator('text=Start here, text=Recommended, text=Step 1').count() > 0;
  const hasProgressTracking = await page.locator('text=% complete, text=Setup progress, text=Completed').count() > 0;
  
  console.log(`📊 Welcome message: ${hasWelcomeMessage}`);
  console.log(`📊 Quick actions: ${hasQuickActions}`);
  console.log(`📊 Feature cards: ${hasFeatureCards}`);
  console.log(`📊 Priority guidance: ${hasPriorityGuidance}`);
  console.log(`📊 Progress tracking: ${hasProgressTracking}`);
  
  userJourney.push({
    step: currentStep++,
    page: 'Dashboard',
    clarity: hasFeatureCards ? 'Good' : 'Poor',
    guidance: hasPriorityGuidance ? 'Good' : 'Missing',
    issues: !hasPriorityGuidance ? ['No clear starting point'] : []
  });
  
  if (hasFeatureCards) {
    uxStrengths.push('Clear feature overview with visual cards');
  } else {
    uxIssues.push('No clear feature overview');
  }
  
  if (!hasPriorityGuidance) {
    uxIssues.push('No guidance on what to do first');
    improvementSuggestions.push('Add "Start here: Set up your menu" guidance');
  }
  
  if (!hasProgressTracking) {
    uxIssues.push('No progress tracking for setup completion');
    improvementSuggestions.push('Add setup completion progress (e.g., "3 of 5 steps completed")');
  }

  // ANALYSIS 3: Feature Page Navigation
  console.log('\n🛍️ ANALYSIS 3: Feature Page Navigation');
  console.log('======================================');
  
  await page.goto('/restaurant/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/ux-analysis-03-products.png', fullPage: true });
  
  // Check for clear actions and guidance
  const hasAddButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').count() > 0;
  const hasEmptyState = await page.locator('text=No products, text=Get started, text=Add your first').count() > 0;
  const hasBackNavigation = await page.locator('button:has-text("Back"), a:has-text("Dashboard")').count() > 0;
  const hasHelpInContext = await page.locator('text=How to, text=Help, text=Guide').count() > 0;
  const hasBreadcrumbs = await page.locator('[data-testid="breadcrumb"], .breadcrumb').count() > 0;
  
  console.log(`📊 Add/Create button: ${hasAddButton}`);
  console.log(`📊 Empty state guidance: ${hasEmptyState}`);
  console.log(`📊 Back navigation: ${hasBackNavigation}`);
  console.log(`📊 Contextual help: ${hasHelpInContext}`);
  console.log(`📊 Breadcrumbs: ${hasBreadcrumbs}`);
  
  userJourney.push({
    step: currentStep++,
    page: 'Products',
    clarity: hasAddButton ? 'Good' : 'Poor',
    guidance: hasEmptyState ? 'Good' : 'Missing',
    issues: !hasEmptyState ? ['No guidance for empty state'] : []
  });
  
  if (hasAddButton) {
    uxStrengths.push('Clear primary action button');
  } else {
    uxIssues.push('Primary action not obvious');
  }
  
  if (!hasEmptyState) {
    uxIssues.push('No guidance when page is empty');
    improvementSuggestions.push('Add empty state with "Add your first product" guidance');
  }
  
  if (!hasBreadcrumbs) {
    uxIssues.push('No breadcrumb navigation');
    improvementSuggestions.push('Add breadcrumbs: Dashboard > Products');
  }

  // ANALYSIS 4: Information Architecture
  console.log('\n🗂️ ANALYSIS 4: Information Architecture');
  console.log('======================================');
  
  // Test multiple pages for consistent navigation
  const testPages = [
    '/restaurant/orders',
    '/restaurant/customers',
    '/restaurant/analytics'
  ];
  
  let consistentNavigation = 0;
  let clearPageTitles = 0;
  
  for (const testPage of testPages) {
    try {
      await page.goto(testPage);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
      const hasPageTitle = await page.locator('h1, [data-testid="page-title"]').count() > 0;
      
      if (hasNavigation) consistentNavigation++;
      if (hasPageTitle) clearPageTitles++;
      
      console.log(`📊 ${testPage}: Navigation(${hasNavigation}) Title(${hasPageTitle})`);
      
    } catch (error) {
      console.log(`⚠️ Could not test ${testPage}: ${error}`);
    }
  }
  
  const navigationConsistency = consistentNavigation / testPages.length;
  const titleConsistency = clearPageTitles / testPages.length;
  
  console.log(`📊 Navigation consistency: ${Math.round(navigationConsistency * 100)}%`);
  console.log(`📊 Page title consistency: ${Math.round(titleConsistency * 100)}%`);
  
  if (navigationConsistency >= 0.8) {
    uxStrengths.push('Consistent navigation across pages');
  } else {
    uxIssues.push('Inconsistent navigation between pages');
  }
  
  if (titleConsistency >= 0.8) {
    uxStrengths.push('Clear page titles throughout');
  } else {
    uxIssues.push('Inconsistent page titling');
  }

  // FINAL UX ASSESSMENT
  console.log('\n🧠 "DON\'T MAKE ME THINK" FINAL ASSESSMENT');
  console.log('==========================================');
  
  const totalIssues = uxIssues.length;
  const totalStrengths = uxStrengths.length;
  const uxScore = totalStrengths / (totalStrengths + totalIssues);
  
  console.log(`📊 UX Strengths: ${totalStrengths}`);
  console.log(`📊 UX Issues: ${totalIssues}`);
  console.log(`📊 Overall UX Score: ${Math.round(uxScore * 100)}%`);
  
  console.log('\n✅ UX STRENGTHS:');
  uxStrengths.forEach((strength, index) => {
    console.log(`   ${index + 1}. ${strength}`);
  });
  
  console.log('\n❌ UX ISSUES:');
  uxIssues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  
  console.log('\n💡 IMPROVEMENT SUGGESTIONS:');
  improvementSuggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion}`);
  });
  
  console.log('\n🗺️ USER JOURNEY ANALYSIS:');
  userJourney.forEach((journey, index) => {
    console.log(`   ${journey.step}. ${journey.page}: Clarity(${journey.clarity}) Guidance(${journey.guidance})`);
    if (journey.issues.length > 0) {
      journey.issues.forEach((issue: string) => console.log(`      ⚠️ ${issue}`));
    }
  });
  
  // UX Rating
  if (uxScore >= 0.8) {
    console.log('\n🎉 EXCELLENT UX: Follows "Don\'t Make Me Think" principles well!');
  } else if (uxScore >= 0.6) {
    console.log('\n✅ GOOD UX: Mostly follows usability principles, some improvements needed');
  } else if (uxScore >= 0.4) {
    console.log('\n⚠️ FAIR UX: Some good elements, but significant improvements needed');
  } else {
    console.log('\n❌ NEEDS WORK: Major UX improvements required for better usability');
  }
  
  console.log('\n🎯 PRIORITY FIXES FOR "DON\'T MAKE ME THINK":');
  console.log('1. Add next step previews in setup flow');
  console.log('2. Create clear onboarding sequence on dashboard');
  console.log('3. Add empty state guidance for all pages');
  console.log('4. Implement breadcrumb navigation');
  console.log('5. Add setup progress tracking');
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/ux-analysis-final.png', fullPage: true });
  
  // Test assertion
  expect(uxScore).toBeGreaterThan(0.3); // At least basic usability
});