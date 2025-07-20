'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Calendar,
  Smartphone,
  Database,
  Eye,
  Target,
  Zap,
  ArrowRight,
  TestTube,
  Play,
  CheckCircle
} from 'lucide-react';

export default function TestHeraIntelligencePage() {
  const testScenarios = [
    {
      id: 'universal-dashboard',
      title: 'Universal Intelligence Dashboard',
      description: 'Test the main AI-native business intelligence interface',
      url: '/universal-intelligence',
      features: [
        'Real-time AI metrics',
        'Natural language commands',
        'Mobile-first design',
        'Universal schema compliance'
      ],
      testActions: [
        'Click "Vibe Coding" commands',
        'Watch real-time metrics update',
        'Test mobile responsiveness',
        'Verify AI confidence scoring'
      ]
    },
    {
      id: 'quarter-end-close',
      title: 'Quarter-End Close Management',
      description: 'Test the AI-powered financial close process system',
      url: '/universal-intelligence/quarter-end-close',
      features: [
        '10-step close process',
        'AI automation recommendations',
        'Progress tracking',
        'Compliance monitoring'
      ],
      testActions: [
        'Start/Complete close steps',
        'Execute AI commands',
        'Check automation levels',
        'Review compliance status'
      ]
    },
    {
      id: 'pattern-discovery',
      title: 'AI Pattern Discovery',
      description: 'Test AI learning and pattern recognition capabilities',
      url: '/universal-intelligence#patterns',
      features: [
        'Pattern discovery engine',
        'Business insights generation',
        'Confidence scoring',
        'Actionable recommendations'
      ],
      testActions: [
        'Run pattern discovery',
        'Review AI insights',
        'Check confidence scores',
        'Test recommendation implementation'
      ]
    },
    {
      id: 'mobile-testing',
      title: 'Mobile-First Capabilities',
      description: 'Test offline functionality and mobile features',
      url: '/universal-intelligence#mobile',
      features: [
        'Offline operations',
        'Camera scanning simulation',
        'Sync status monitoring',
        'Mobile performance metrics'
      ],
      testActions: [
        'Simulate offline operations',
        'Test camera scanning',
        'Monitor sync status',
        'Check mobile metrics'
      ]
    }
  ];

  const quickTests = [
    {
      name: 'AI Command Test',
      description: 'Test natural language business commands',
      action: 'Click any "Try These Commands" button',
      expected: 'AI transaction created with confidence score'
    },
    {
      name: 'Real-time Updates Test',
      description: 'Test live data updates',
      action: 'Wait 5 seconds and watch metrics change',
      expected: 'Numbers update automatically'
    },
    {
      name: 'Mobile Responsiveness Test',
      description: 'Test mobile-first design',
      action: 'Resize browser window or use mobile device',
      expected: 'Layout adapts perfectly to screen size'
    },
    {
      name: 'Universal Schema Test',
      description: 'Test HERA compliance',
      action: 'Check Universal Schema tab',
      expected: '0 new tables created, 100% compliance'
    },
    {
      name: 'Offline Capability Test',
      description: 'Test offline functionality',
      action: 'Click "Create Offline Order" in mobile tab',
      expected: 'Offline operation completes successfully'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HERA Universal Intelligence Testing
        </h1>
        <p className="text-lg text-gray-600">
          Manual testing guide for the AI-native business intelligence system
        </p>
        <Badge className="bg-green-100 text-green-800">
          <TestTube className="w-4 h-4 mr-1" />
          Ready for Testing
        </Badge>
      </div>

      {/* Quick Test Checklist */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Quick Test Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-sm">{test.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{test.description}</p>
                <div className="space-y-1 text-xs">
                  <div><strong>Action:</strong> {test.action}</div>
                  <div><strong>Expected:</strong> {test.expected}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Test Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testScenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {scenario.id === 'universal-dashboard' && <Brain className="w-5 h-5 mr-2 text-blue-500" />}
                  {scenario.id === 'quarter-end-close' && <Calendar className="w-5 h-5 mr-2 text-purple-500" />}
                  {scenario.id === 'pattern-discovery' && <Eye className="w-5 h-5 mr-2 text-green-500" />}
                  {scenario.id === 'mobile-testing' && <Smartphone className="w-5 h-5 mr-2 text-orange-500" />}
                  <span>{scenario.title}</span>
                </div>
                <Link href={scenario.url}>
                  <Button size="sm">
                    <Play className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{scenario.description}</p>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Features to Test:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {scenario.features.map((feature, idx) => (
                    <div key={idx} className="text-xs flex items-center">
                      <Target className="w-3 h-3 mr-1 text-blue-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Test Actions:</h4>
                <div className="space-y-1">
                  {scenario.testActions.map((action, idx) => (
                    <div key={idx} className="text-xs flex items-start">
                      <ArrowRight className="w-3 h-3 mr-1 text-purple-500 mt-0.5 flex-shrink-0" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
              
              <Link href={scenario.url}>
                <Button className="w-full" variant="outline">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Testing {scenario.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browser Console Testing */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-500" />
            Browser Console Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Open browser developer tools (F12) and watch the console while testing. Look for:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Console Messages to Look For:</h4>
                <ul className="text-xs space-y-1">
                  <li>• "AI Command executed" with transaction details</li>
                  <li>• "Quarter-end AI command executed" with confidence scores</li>
                  <li>• "Offline operation created" with transaction IDs</li>
                  <li>• "Camera scan initiated with AI processing"</li>
                  <li>• "New patterns discovered using AI analysis"</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">HERA Universal Patterns to Verify:</h4>
                <ul className="text-xs space-y-1">
                  <li>• crypto.randomUUID() for ID generation</li>
                  <li>• organization_id in all transactions</li>
                  <li>• Universal transaction structure</li>
                  <li>• AI confidence scoring (0.7-1.0 range)</li>
                  <li>• Entity type naming conventions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-green-500" />
            Mobile Device Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Desktop Browser Mobile Simulation:</h4>
              <ol className="text-sm space-y-1">
                <li>1. Press F12 to open developer tools</li>
                <li>2. Click device toggle icon (📱)</li>
                <li>3. Select "iPhone 12 Pro" or "iPad"</li>
                <li>4. Test touch interactions and gestures</li>
                <li>5. Verify responsive layout adaptation</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Actual Mobile Device Testing:</h4>
              <ol className="text-sm space-y-1">
                <li>1. Connect your mobile to same WiFi</li>
                <li>2. Find your computer's IP address</li>
                <li>3. Visit http://[YOUR-IP]:3000/universal-intelligence</li>
                <li>4. Test offline by turning off WiFi</li>
                <li>5. Verify animations and touch responsiveness</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Performance Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-3">
            <p><strong>Lighthouse Testing:</strong></p>
            <ol className="space-y-1 ml-4">
              <li>1. Open Chrome DevTools (F12)</li>
              <li>2. Go to "Lighthouse" tab</li>
              <li>3. Select "Performance" and "Accessibility"</li>
              <li>4. Click "Generate report"</li>
              <li>5. Verify scores above 90</li>
            </ol>
            
            <p><strong>Expected Performance:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Page load time: &lt;2 seconds</li>
              <li>• 60fps animations and transitions</li>
              <li>• Smooth scrolling and interactions</li>
              <li>• Responsive design at all screen sizes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-600">
          🚀 Ready to test HERA Universal Intelligence!
        </div>
        <div className="text-xs text-gray-500">
          All features demonstrate HERA Universal Schema patterns • AI-native design • Mobile-first architecture
        </div>
      </div>
    </div>
  );
}