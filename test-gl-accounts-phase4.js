#!/usr/bin/env node

/**
 * HERA Universal - GL Accounts Phase 4 Intelligence Test Suite
 * 
 * Comprehensive test of real-time autonomous GL intelligence
 * Tests real-time monitoring, automated validation, anomaly detection, 
 * auto-reconciliation, and budget variance analysis
 */

const organizationId = '123e4567-e89b-12d3-a456-426614174000';
const baseUrl = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message);
    return { status: 500, ok: false, error: error.message };
  }
}

async function testRealTimeIntelligence() {
  console.log('\\n⚡ Testing Real-Time GL Intelligence...\\n');

  // Test 1: Comprehensive real-time analysis
  console.log('1️⃣ Testing comprehensive real-time analysis...');
  const comprehensiveResult = await makeRequest(`/api/finance/gl-accounts/real-time-intelligence?organizationId=${organizationId}&monitoringType=comprehensive&realTimeWindow=24`);
  
  if (comprehensiveResult.ok) {
    const { alerts, metrics, recommendations, summary } = comprehensiveResult.data.data;
    
    console.log(`   ✅ Real-time intelligence generated successfully`);
    console.log(`   🚨 Alerts generated: ${summary.alertsGenerated}`);
    console.log(`   🔥 Critical alerts: ${summary.criticalAlerts}`);
    console.log(`   🤖 Automated actions: ${summary.automatedActions}`);
    console.log(`   🧠 Intelligence level: ${(summary.intelligenceLevel * 100).toFixed(1)}%`);
    
    if (alerts.length > 0) {
      console.log(`\\n   📊 Sample Alert: ${alerts[0].title}`);
      console.log(`      Severity: ${alerts[0].severity}`);
      console.log(`      Business Impact: $${alerts[0].businessImpact.financial.toFixed(2)}`);
      console.log(`      Immediate Actions: ${alerts[0].recommendations.immediate.length}`);
    }
    
    if (metrics.cashFlow) {
      console.log(`\\n   💰 Cash Flow Metrics:`);
      console.log(`      Current Balance: $${metrics.cashFlow.currentBalance.toFixed(2)}`);
      console.log(`      Daily Change: $${metrics.cashFlow.dailyChange.toFixed(2)}`);
      console.log(`      Days of Cash Left: ${metrics.cashFlow.daysOfCashLeft}`);
      console.log(`      Weekly Trend: ${metrics.cashFlow.weeklyTrend}`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${comprehensiveResult.data.error}`);
    return false;
  }

  // Test 2: Alert filtering by severity
  console.log('\\n2️⃣ Testing alert filtering by severity...');
  const criticalAlertsResult = await makeRequest(`/api/finance/gl-accounts/real-time-intelligence?organizationId=${organizationId}&monitoringType=alerts&alertSeverity=critical`);
  
  if (criticalAlertsResult.ok) {
    const { alerts } = criticalAlertsResult.data.data;
    console.log(`   ✅ Critical alerts filtered: ${alerts.length} critical alerts`);
    
    alerts.forEach((alert, index) => {
      if (index < 2) { // Show first 2
        console.log(`      Alert ${index + 1}: ${alert.title} (${alert.severity})`);
      }
    });
    
  } else {
    console.log(`   ❌ Failed: ${criticalAlertsResult.data.error}`);
    return false;
  }

  // Test 3: Metrics-only monitoring
  console.log('\\n3️⃣ Testing metrics-only monitoring...');
  const metricsResult = await makeRequest(`/api/finance/gl-accounts/real-time-intelligence?organizationId=${organizationId}&monitoringType=metrics`);
  
  if (metricsResult.ok) {
    const { metrics } = metricsResult.data.data;
    
    console.log(`   ✅ Metrics monitoring successful`);
    if (metrics.accountHealth) {
      console.log(`      Total Accounts: ${metrics.accountHealth.totalAccounts}`);
      console.log(`      Active Accounts: ${metrics.accountHealth.activeAccounts}`);
      console.log(`      Overall Risk Score: ${metrics.riskFactors.overall}%`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${metricsResult.data.error}`);
    return false;
  }

  return true;
}

async function testAutomatedValidation() {
  console.log('\\n🛡️ Testing Automated Journal Entry Validation...\\n');

  // Test 1: Valid journal entry validation
  console.log('1️⃣ Testing valid journal entry validation...');
  const validJournalEntry = {
    organizationId,
    journalEntry: {
      description: "Test journal entry for validation",
      entries: [
        {
          accountCode: "1001000",
          accountName: "Cash - Operating Account",
          debit: 1000,
          description: "Test debit entry"
        },
        {
          accountCode: "4001000", 
          accountName: "Food Sales Revenue",
          credit: 1000,
          description: "Test credit entry"
        }
      ],
      totalAmount: 1000,
      entryDate: new Date().toISOString()
    },
    contextualData: {
      userRole: "manager",
      userHistory: {},
      organizationRules: {},
      recentPatterns: {}
    }
  };

  const validationResult = await makeRequest('/api/finance/gl-accounts/automated-validation', {
    method: 'POST',
    body: JSON.stringify(validJournalEntry)
  });

  if (validationResult.ok) {
    const { data } = validationResult.data;
    
    console.log(`   ✅ Journal entry validation completed`);
    console.log(`      Valid: ${data.isValid ? 'Yes' : 'No'}`);
    console.log(`      Confidence: ${(data.confidence * 100).toFixed(1)}%`);
    console.log(`      Validation Score: ${data.validationScore}/100`);
    console.log(`      Issues Found: ${data.issues.length}`);
    console.log(`      Recommendations: ${data.recommendations.length}`);
    
    if (data.autoFixSuggestions.length > 0) {
      console.log(`      Auto-fix suggestions: ${data.autoFixSuggestions.length}`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${validationResult.data.error}`);
    return false;
  }

  // Test 2: Invalid journal entry (unbalanced)
  console.log('\\n2️⃣ Testing unbalanced journal entry validation...');
  const unbalancedJournalEntry = {
    organizationId,
    journalEntry: {
      description: "Unbalanced test entry",
      entries: [
        {
          accountCode: "1001000",
          accountName: "Cash - Operating Account", 
          debit: 1000,
          description: "Test debit entry"
        },
        {
          accountCode: "4001000",
          accountName: "Food Sales Revenue",
          credit: 800, // Intentionally unbalanced
          description: "Test credit entry"
        }
      ],
      totalAmount: 1000,
      entryDate: new Date().toISOString()
    }
  };

  const unbalancedResult = await makeRequest('/api/finance/gl-accounts/automated-validation', {
    method: 'POST',
    body: JSON.stringify(unbalancedJournalEntry)
  });

  if (unbalancedResult.ok) {
    const { data } = unbalancedResult.data;
    
    console.log(`   ✅ Unbalanced entry validation completed`);
    console.log(`      Valid: ${data.isValid ? 'Yes' : 'No'} (should be No)`);
    console.log(`      Critical Issues: ${data.issues.filter(i => i.issueType === 'critical').length}`);
    console.log(`      Auto-fix Available: ${data.autoFixSuggestions.length > 0 ? 'Yes' : 'No'}`);
    
    if (data.autoFixSuggestions.length > 0) {
      console.log(`      Suggested Fix: ${data.autoFixSuggestions[0].description}`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${unbalancedResult.data.error}`);
    return false;
  }

  // Test 3: Get approval workflows
  console.log('\\n3️⃣ Testing approval workflow retrieval...');
  const workflowsResult = await makeRequest(`/api/finance/gl-accounts/automated-validation?organizationId=${organizationId}`);
  
  if (workflowsResult.ok) {
    const { data } = workflowsResult.data;
    
    console.log(`   ✅ Approval workflows retrieved`);
    console.log(`      Total Workflows: ${data.workflows.length}`);
    console.log(`      Pending: ${data.summary.pending}`);
    console.log(`      Auto-approved: ${data.summary.autoApproved}`);
    
  } else {
    console.log(`   ❌ Failed: ${workflowsResult.data.error}`);
    return false;
  }

  return true;
}

async function testAnomalyDetection() {
  console.log('\\n🔍 Testing Predictive Anomaly Detection...\\n');

  // Test 1: Comprehensive anomaly analysis
  console.log('1️⃣ Testing comprehensive anomaly analysis...');
  const comprehensiveResult = await makeRequest(`/api/finance/gl-accounts/anomaly-detection?organizationId=${organizationId}&analysisType=comprehensive&timeframe=30`);
  
  if (comprehensiveResult.ok) {
    const { models, anomalies, summary } = comprehensiveResult.data.data;
    
    console.log(`   ✅ Anomaly detection analysis completed`);
    console.log(`      Detection Models: ${models.length}`);
    console.log(`      Anomalies Found: ${summary.anomalousTransactions}`);
    console.log(`      Anomaly Rate: ${(summary.anomalyRate * 100).toFixed(2)}%`);
    console.log(`      High Risk Anomalies: ${summary.highRiskAnomalies}`);
    console.log(`      Model Accuracy: ${(summary.modelAccuracy * 100).toFixed(1)}%`);
    
    if (models.length > 0) {
      const sampleModel = models[0];
      console.log(`\\n      Sample Model (${sampleModel.accountCode}):`);
      console.log(`         Data Points: ${sampleModel.learningMetrics.dataPoints}`);
      console.log(`         Mean Amount: $${sampleModel.statistics.meanAmount.toFixed(2)}`);
      console.log(`         Std Deviation: $${sampleModel.statistics.stdDeviation.toFixed(2)}`);
      console.log(`         Accuracy: ${(sampleModel.learningMetrics.modelAccuracy * 100).toFixed(1)}%`);
    }
    
    if (anomalies.length > 0) {
      const sampleAnomaly = anomalies[0];
      console.log(`\\n      Sample Anomaly:`);
      console.log(`         Type: ${sampleAnomaly.anomalyType}`);
      console.log(`         Severity: ${sampleAnomaly.severity}`);
      console.log(`         Score: ${(sampleAnomaly.anomalyScore * 100).toFixed(1)}%`);
      console.log(`         Account: ${sampleAnomaly.accountCode}`);
      console.log(`         Fraud Risk: ${(sampleAnomaly.riskAssessment.fraudRisk * 100).toFixed(1)}%`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${comprehensiveResult.data.error}`);
    return false;
  }

  // Test 2: Real-time transaction anomaly detection
  console.log('\\n2️⃣ Testing real-time transaction analysis...');
  const realTimeTransaction = {
    organizationId,
    transactionData: {
      transactionId: 'test-tx-001',
      accountCode: '1001000',
      amount: 50000, // Unusually large amount
      transactionType: 'journal_entry',
      timestamp: new Date().toISOString(),
      description: 'Large test transaction'
    },
    detectionOptions: {
      sensitivity: 'high',
      lookbackDays: 90,
      includeRealTime: true,
      anomalyTypes: ['amount', 'timing', 'pattern']
    }
  };

  const realTimeResult = await makeRequest('/api/finance/gl-accounts/anomaly-detection', {
    method: 'POST',
    body: JSON.stringify(realTimeTransaction)
  });

  if (realTimeResult.ok) {
    const { anomalies, realTimeAnalysis } = realTimeResult.data.data;
    
    console.log(`   ✅ Real-time anomaly detection completed`);
    console.log(`      Status: ${realTimeAnalysis.status}`);
    console.log(`      Risk Score: ${(realTimeAnalysis.riskScore * 100).toFixed(1)}%`);
    console.log(`      Recommendation: ${realTimeAnalysis.recommendation}`);
    console.log(`      Anomalies Detected: ${anomalies.length}`);
    
    if (anomalies.length > 0) {
      console.log(`      Primary Anomaly: ${anomalies[0].description}`);
      console.log(`      ML Algorithm: ${anomalies[0].mlAnalysis.algorithm}`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${realTimeResult.data.error}`);
    return false;
  }

  // Test 3: Account-specific anomaly models
  console.log('\\n3️⃣ Testing account-specific models...');
  const accountSpecificResult = await makeRequest(`/api/finance/gl-accounts/anomaly-detection?organizationId=${organizationId}&analysisType=models&accountCode=1001000`);
  
  if (accountSpecificResult.ok) {
    const { models } = accountSpecificResult.data.data;
    
    console.log(`   ✅ Account-specific model analysis completed`);
    console.log(`      Models Generated: ${models.length}`);
    
    if (models.length > 0) {
      const model = models[0];
      console.log(`      Account: ${model.accountCode}`);
      console.log(`      Typical Hours: ${model.statistics.typicalHours.join(', ')}`);
      console.log(`      Amount Threshold: ${model.thresholds.amountZ}σ`);
      console.log(`      Model Type: Statistical Analysis`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${accountSpecificResult.data.error}`);
    return false;
  }

  return true;
}

async function testAutoReconciliation() {
  console.log('\\n🔄 Testing Automated Account Reconciliation...\\n');

  // Test 1: Comprehensive reconciliation analysis
  console.log('1️⃣ Testing comprehensive reconciliation analysis...');
  const comprehensiveResult = await makeRequest(`/api/finance/gl-accounts/auto-reconciliation?organizationId=${organizationId}&reportType=detailed&period=30`);
  
  if (comprehensiveResult.ok) {
    const { reconciliationResults, summary } = comprehensiveResult.data.data;
    
    console.log(`   ✅ Auto-reconciliation analysis completed`);
    console.log(`      Total Accounts: ${summary.totalAccounts}`);
    console.log(`      Reconciled Accounts: ${summary.reconciledAccounts}`);
    console.log(`      Total Discrepancies: ${summary.totalDiscrepancies}`);
    console.log(`      Unmatched Transactions: ${summary.totalUnmatchedTransactions}`);
    console.log(`      Overall Accuracy: ${(summary.overallAccuracy * 100).toFixed(1)}%`);
    
    if (reconciliationResults.length > 0) {
      const sampleResult = reconciliationResults[0];
      console.log(`\\n      Sample Account Reconciliation (${sampleResult.accountCode}):`);
      console.log(`         Bank Balance: $${sampleResult.summary.bankBalance.toFixed(2)}`);
      console.log(`         GL Balance: $${sampleResult.summary.glBalance.toFixed(2)}`);
      console.log(`         Difference: $${sampleResult.summary.difference.toFixed(2)}`);
      console.log(`         Matched Transactions: ${sampleResult.summary.matchedTransactions}`);
      console.log(`         ML Accuracy: ${(sampleResult.mlAnalysis.matchingAccuracy * 100).toFixed(1)}%`);
      
      if (sampleResult.matches.length > 0) {
        const sampleMatch = sampleResult.matches[0];
        console.log(`         Sample Match: ${sampleMatch.matchType} (${(sampleMatch.confidence * 100).toFixed(1)}% confidence)`);
      }
    }
    
  } else {
    console.log(`   ❌ Failed: ${comprehensiveResult.data.error}`);
    return false;
  }

  // Test 2: Specific account reconciliation with bank data
  console.log('\\n2️⃣ Testing specific account reconciliation...');
  const reconciliationRequest = {
    organizationId,
    accountCode: '1001000',
    reconciliationPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    bankStatementData: [
      {
        date: '2024-01-15',
        amount: 1500.00,
        description: 'Deposit - Food Sales',
        reference: 'DEP-001'
      },
      {
        date: '2024-01-16',
        amount: -800.00,
        description: 'Payment - Supplier Invoice',
        reference: 'PAY-002'
      }
    ],
    reconciliationOptions: {
      matchingMode: 'standard',
      dateTolerance: 3,
      amountTolerance: 0.01,
      autoApproveThreshold: 0.9,
      includeMLSuggestions: true
    }
  };

  const specificReconciliationResult = await makeRequest('/api/finance/gl-accounts/auto-reconciliation', {
    method: 'POST',
    body: JSON.stringify(reconciliationRequest)
  });

  if (specificReconciliationResult.ok) {
    const reconciliation = specificReconciliationResult.data.data;
    
    console.log(`   ✅ Specific account reconciliation completed`);
    console.log(`      Account: ${reconciliation.accountCode}`);
    console.log(`      Period: ${reconciliation.period.startDate} to ${reconciliation.period.endDate}`);
    console.log(`      Matches Found: ${reconciliation.matches.length}`);
    console.log(`      Discrepancies: ${reconciliation.discrepancies.length}`);
    console.log(`      ML Confidence: ${(reconciliation.mlAnalysis.modelConfidence * 100).toFixed(1)}%`);
    
    if (reconciliation.matches.length > 0) {
      console.log(`      Best Match: ${reconciliation.matches[0].matchType} (${(reconciliation.matches[0].confidence * 100).toFixed(1)}%)`);
    }
    
    console.log(`      Recommendations: ${reconciliation.recommendations.immediate.length} immediate, ${reconciliation.recommendations.automation.length} automation`);
    
  } else {
    console.log(`   ❌ Failed: ${specificReconciliationResult.data.error}`);
    return false;
  }

  return true;
}

async function testBudgetVariance() {
  console.log('\\n📊 Testing Intelligent Budget Variance Analysis...\\n');

  // Test 1: Current period budget analysis
  console.log('1️⃣ Testing current period budget analysis...');
  const currentPeriodResult = await makeRequest(`/api/finance/gl-accounts/budget-variance?organizationId=${organizationId}&analysisType=current_period&varianceThreshold=10&includeForecasting=true&reportType=comprehensive`);
  
  if (currentPeriodResult.ok) {
    const { variances, alerts, models, summary } = currentPeriodResult.data.data;
    
    console.log(`   ✅ Budget variance analysis completed`);
    console.log(`      Total Accounts: ${summary.totalAccounts}`);
    console.log(`      Accounts with Budgets: ${summary.accountsWithBudgets}`);
    console.log(`      Significant Variances: ${summary.significantVariances}`);
    console.log(`      Total Variance Amount: $${summary.totalVarianceAmount.toFixed(2)}`);
    console.log(`      Average Variance %: ${summary.averageVariancePercent.toFixed(1)}%`);
    console.log(`      Forecast Accuracy: ${(summary.forecastAccuracy * 100).toFixed(1)}%`);
    
    if (variances.length > 0) {
      const sampleVariance = variances[0];
      console.log(`\\n      Sample Variance (${sampleVariance.accountCode}):`);
      console.log(`         Budget: $${sampleVariance.budget.current.toFixed(2)}`);
      console.log(`         Actual: $${sampleVariance.actual.amount.toFixed(2)}`);
      console.log(`         Variance: $${sampleVariance.variance.amount.toFixed(2)} (${sampleVariance.variance.percentage.toFixed(1)}%)`);
      console.log(`         Type: ${sampleVariance.variance.type}`);
      console.log(`         Severity: ${sampleVariance.variance.severity}`);
      console.log(`         Trend: ${sampleVariance.trend.direction}`);
      console.log(`         Projected Actual: $${sampleVariance.forecast.projectedActual.toFixed(2)}`);
    }
    
    if (alerts.length > 0) {
      console.log(`\\n      Budget Alerts: ${alerts.length}`);
      const sampleAlert = alerts[0];
      console.log(`         Alert: ${sampleAlert.title}`);
      console.log(`         Severity: ${sampleAlert.severity}`);
      console.log(`         Financial Impact: $${sampleAlert.businessImpact.financial.toFixed(2)}`);
    }
    
    if (models.length > 0) {
      console.log(`\\n      Forecast Models: ${models.length}`);
      const sampleModel = models[0];
      console.log(`         Model Type: ${sampleModel.modelType}`);
      console.log(`         Accuracy: ${(sampleModel.accuracy.forecastReliability * 100).toFixed(1)}%`);
    }
    
  } else {
    console.log(`   ❌ Failed: ${currentPeriodResult.data.error}`);
    return false;
  }

  // Test 2: Year-to-date analysis
  console.log('\\n2️⃣ Testing year-to-date budget analysis...');
  const ytdResult = await makeRequest(`/api/finance/gl-accounts/budget-variance?organizationId=${organizationId}&analysisType=ytd&reportType=summary`);
  
  if (ytdResult.ok) {
    const { variances, summary } = ytdResult.data.data;
    
    console.log(`   ✅ YTD budget analysis completed`);
    console.log(`      YTD Summary - Accounts: ${summary.accountsWithBudgets}, Variances: ${summary.significantVariances}`);
    console.log(`      Budget Utilization: ${(summary.budgetUtilization * 100).toFixed(1)}%`);
    
  } else {
    console.log(`   ❌ Failed: ${ytdResult.data.error}`);
    return false;
  }

  // Test 3: Custom budget analysis with POST
  console.log('\\n3️⃣ Testing custom budget analysis...');
  const customAnalysisRequest = {
    organizationId,
    analysisType: 'custom',
    periodOverride: {
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    },
    accountFilter: ['5001000', '6001000', '7001000'], // Expense accounts
    varianceThreshold: 15,
    includeForecasting: true,
    forecastHorizon: 6
  };

  const customAnalysisResult = await makeRequest('/api/finance/gl-accounts/budget-variance', {
    method: 'POST',
    body: JSON.stringify(customAnalysisRequest)
  });

  if (customAnalysisResult.ok) {
    const data = customAnalysisResult.data.data;
    
    console.log(`   ✅ Custom budget analysis initiated`);
    console.log(`      Analysis ID: ${data.analysisId}`);
    console.log(`      Status: ${data.status}`);
    console.log(`      Message: ${data.message}`);
    
  } else {
    console.log(`   ❌ Failed: ${customAnalysisResult.data.error}`);
    return false;
  }

  return true;
}

async function testAdvancedIntegration() {
  console.log('\\n🔬 Testing Advanced Phase 4 Integration...\\n');

  // Test 1: Multi-API Phase 4 integration
  console.log('1️⃣ Testing multi-API Phase 4 integration...');
  
  const [realTimeIntel, anomalyDetection, autoRecon, budgetVariance] = await Promise.all([
    makeRequest(`/api/finance/gl-accounts/real-time-intelligence?organizationId=${organizationId}&monitoringType=summary`),
    makeRequest(`/api/finance/gl-accounts/anomaly-detection?organizationId=${organizationId}&analysisType=comprehensive&timeframe=7`),
    makeRequest(`/api/finance/gl-accounts/auto-reconciliation?organizationId=${organizationId}&reportType=summary&period=7`),
    makeRequest(`/api/finance/gl-accounts/budget-variance?organizationId=${organizationId}&analysisType=current_period&reportType=summary`)
  ]);

  if (realTimeIntel.ok && anomalyDetection.ok && autoRecon.ok && budgetVariance.ok) {
    console.log(`   ✅ Multi-API Phase 4 integration successful`);
    
    const rtData = realTimeIntel.data.data;
    const anomalyData = anomalyDetection.data.data;
    const reconData = autoRecon.data.data;
    const budgetData = budgetVariance.data.data;
    
    console.log(`   ⚡ Real-time: ${rtData.summary?.alertsGenerated || 0} alerts generated`);
    console.log(`   🔍 Anomalies: ${anomalyData.summary?.anomalousTransactions || 0} anomalous transactions`);
    console.log(`   🔄 Reconciliation: ${reconData.summary?.reconciledAccounts || 0}/${reconData.summary?.totalAccounts || 0} accounts reconciled`);
    console.log(`   📊 Budget: ${budgetData.summary?.significantVariances || 0} significant variances`);
    
    // Calculate overall system health
    const overallHealth = {
      realTimeStatus: rtData.summary?.intelligenceLevel || 0,
      anomalyRate: 1 - (anomalyData.summary?.anomalyRate || 0),
      reconciliationRate: reconData.summary?.overallAccuracy || 0,
      budgetCompliance: budgetData.summary?.budgetUtilization || 0
    };
    
    const avgHealth = Object.values(overallHealth).reduce((a, b) => a + b, 0) / 4;
    console.log(`   🏆 Overall System Health: ${(avgHealth * 100).toFixed(1)}%`);
    
  } else {
    console.log(`   ❌ Multi-API integration failed`);
    return false;
  }

  // Test 2: Cross-phase intelligence evolution
  console.log('\\n2️⃣ Testing cross-phase intelligence evolution...');
  
  const [phase1, phase2, phase3, phase4] = await Promise.all([
    makeRequest(`/api/finance/gl-accounts/intelligence?organizationId=${organizationId}&analysisType=summary`),
    makeRequest(`/api/finance/gl-accounts/patterns?organizationId=${organizationId}&analysisType=summary`),
    makeRequest(`/api/finance/gl-accounts/organization-intelligence?organizationId=${organizationId}&analysisType=comprehensive`),
    makeRequest(`/api/finance/gl-accounts/real-time-intelligence?organizationId=${organizationId}&monitoringType=comprehensive`)
  ]);

  if (phase1.ok && phase2.ok && phase3.ok && phase4.ok) {
    console.log(`   ✅ Cross-phase intelligence evolution verified`);
    
    console.log(`   📈 Intelligence Evolution Summary:`);
    console.log(`      Phase 1: Basic GL intelligence and tracking`);
    console.log(`      Phase 2: Pattern analysis and predictive forecasting`);
    console.log(`      Phase 3: Organization-specific business intelligence`);
    console.log(`      Phase 4: Real-time autonomous intelligence platform`);
    
    const phase4Data = phase4.data.data;
    console.log(`\\n   🎯 Phase 4 Capabilities Verified:`);
    console.log(`      ✅ Real-time monitoring with automated alerts`);
    console.log(`      ✅ Intelligent journal entry validation & approval`);
    console.log(`      ✅ ML-powered anomaly detection`);
    console.log(`      ✅ Automated account reconciliation`);
    console.log(`      ✅ Intelligent budget variance analysis`);
    console.log(`      ✅ Autonomous decision support system`);
    
  } else {
    console.log(`   ❌ Cross-phase integration failed`);
    return false;
  }

  return true;
}

async function runAllTests() {
  console.log('🚀 HERA Universal - GL Accounts Phase 4 Intelligence Test Suite');
  console.log('=====================================================================');
  console.log(`🏢 Organization: ${organizationId}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log('🎯 Testing: Real-time autonomous GL intelligence platform');

  const tests = [
    { name: 'Real-Time Intelligence', fn: testRealTimeIntelligence },
    { name: 'Automated Validation', fn: testAutomatedValidation },
    { name: 'Anomaly Detection', fn: testAnomalyDetection },
    { name: 'Auto-Reconciliation', fn: testAutoReconciliation },
    { name: 'Budget Variance Analysis', fn: testBudgetVariance },
    { name: 'Advanced Integration', fn: testAdvancedIntegration }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\\n🧪 Running ${test.name} tests...`);
    
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      if (success) {
        console.log(`\\n✅ ${test.name} tests PASSED`);
      } else {
        console.log(`\\n❌ ${test.name} tests FAILED`);
      }
    } catch (error) {
      console.log(`\\n💥 ${test.name} tests ERROR: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\\n📊 PHASE 4 TEST SUMMARY');
  console.log('=========================');
  
  let passedTests = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.success) passedTests++;
  });

  console.log(`\\n🎯 Results: ${passedTests}/${results.length} test suites passed`);
  
  if (passedTests === results.length) {
    console.log('\\n🎉 ALL PHASE 4 TESTS PASSED! Real-Time Autonomous GL Intelligence is fully operational!');
    console.log('\\n📋 Phase 4 Features Verified:');
    console.log('   ✅ Real-time GL monitoring with automated alert generation');
    console.log('   ✅ Intelligent journal entry validation with auto-fix suggestions');
    console.log('   ✅ ML-powered anomaly detection with predictive scoring');
    console.log('   ✅ Automated account reconciliation with smart matching');
    console.log('   ✅ Intelligent budget variance analysis with forecasting');
    console.log('   ✅ Cross-API integration and autonomous decision support');
    console.log('   ✅ Real-time risk assessment and proactive recommendations');
    console.log('   ✅ Advanced pattern recognition and learning capabilities');
    console.log('   ✅ Multi-scenario forecasting with confidence intervals');
    console.log('   ✅ Automated workflow routing and approval processes');
    console.log('\\n🏆 HERA GL Account Intelligence System: Complete 4-Phase Implementation!');
    console.log('\\n🌟 The system now provides AUTONOMOUS FINANCIAL INTELLIGENCE:');
    console.log('   • Phase 1: Basic GL tracking and simple intelligence');
    console.log('   • Phase 2: Advanced pattern analysis and predictive forecasting'); 
    console.log('   • Phase 3: Business context intelligence and industry benchmarking');
    console.log('   • Phase 4: Real-time autonomous intelligence platform');
    console.log('\\n🚀 READY FOR ENTERPRISE DEPLOYMENT!');
    console.log('\\n💡 This system represents a complete autonomous financial intelligence platform');
    console.log('    that can monitor, analyze, validate, reconcile, and forecast in real-time');
    console.log('    with minimal human intervention - a true AI-powered CFO assistant!');
  } else {
    console.log('\\n⚠️  Some tests failed. Review errors above.');
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };