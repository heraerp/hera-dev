/**
 * 🚀 HERA Universal Data Migration System
 * Choose your migration approach - Legacy mapping or AI-powered conversion
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Database, Zap, FileText, GitBranch, Clock, Users, HelpCircle, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'

export default function MigrationPage() {
  const [showDecisionHelper, setShowDecisionHelper] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Move Your Data to HERA Universal
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            We'll guide you through every step. Choose the path that feels right for you.
          </p>
          
          {/* Quick Decision Helper */}
          <Alert className="max-w-2xl mx-auto mb-8 border-amber-200 bg-amber-50">
            <HelpCircle className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Not sure which option to choose?</strong> 
              <button 
                onClick={() => setShowDecisionHelper(!showDecisionHelper)}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Click here for a 30-second decision helper
              </button>
            </AlertDescription>
          </Alert>

          {/* Decision Helper */}
          {showDecisionHelper && (
            <Card className="max-w-3xl mx-auto mb-8 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Quick Decision Helper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">Choose Legacy Mapping if you:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Want to see exactly how your data will map</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Have complex or unusual data structures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Want to control every mapping decision</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Are new to HERA Universal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-600">Choose AI Migration if you:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Have restaurant menu data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Want fast, automated migration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Trust AI to make good decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Want GL codes assigned automatically</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Migration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Legacy Data Mapping - Primary Option */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 relative">
            <div className="absolute -top-3 left-6">
              <Badge className="bg-blue-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 text-blue-600" />
                Step-by-Step Data Mapping
              </CardTitle>
              <CardDescription className="text-base">
                See exactly how your data transforms. Perfect for beginners and complex data.
              </CardDescription>
              
              {/* Quick Stats */}
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  15-30 min
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Any skill level
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm">Upload your data file and we'll analyze it instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm">Review AI suggestions side-by-side with your data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm">Adjust mappings with simple clicks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span className="text-sm">Export your mapping plan for implementation</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">Perfect for:</div>
                <div className="text-xs text-muted-foreground">
                  Any data type • Complex structures • Learning HERA • Full control
                </div>
              </div>
              
              <Link href="/migration/legacy-mapping">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  Start Step-by-Step Mapping
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Menu Migration - Secondary Option */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 relative">
            <div className="absolute -top-3 left-6">
              <Badge className="bg-purple-600 text-white">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-purple-600" />
                AI Smart Migration
              </CardTitle>
              <CardDescription className="text-base">
                Let AI handle everything. Upload your menu and get instant results.
              </CardDescription>
              
              {/* Quick Stats */}
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  2-5 min
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Restaurant menus
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm">Upload your menu (any format works)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm">AI parses and categorizes everything instantly</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm">GL codes assigned automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span className="text-sm">Review and migrate with one click</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">Perfect for:</div>
                <div className="text-xs text-muted-foreground">
                  Restaurant menus • Fast results • Trust AI • Automatic GL codes
                </div>
              </div>
              
              <Link href="/migration/ai-menu">
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-lg py-6">
                  Try AI Smart Migration
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* What Happens Next */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                What Happens After You Choose
              </CardTitle>
              <CardDescription>
                We guide you through every step. Here's exactly what to expect:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Upload Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop your file. We support JSON, CSV, Excel and more.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Takes 30 seconds</Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <GitBranch className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">See AI Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    AI shows you how each field maps to HERA. Adjust with simple clicks.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">10-15 minutes</Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Review & Approve</h4>
                  <p className="text-sm text-muted-foreground">
                    See a preview of your migrated data. Make final adjustments.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">5 minutes</Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium mb-2">Get Your Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Download mapping config or migrate directly to HERA Universal.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Instant</Badge>
                  </div>
                </div>
              </div>
              
              {/* Success guarantee */}
              <div className="mt-8 text-center">
                <Alert className="max-w-md mx-auto border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>100% Success Guarantee:</strong> If you get stuck at any step, 
                    our AI will guide you to the solution or provide sample data to practice with.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Migration?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Most users complete their data mapping in under 20 minutes. 
                Our AI makes it simple - even if you've never done this before.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/migration/legacy-mapping">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Start with Step-by-Step Mapping
                  </Button>
                </Link>
                <Link href="/migration/ai-menu">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                    Try AI Smart Migration
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-blue-200 mt-4">
                No account required • Free to try • Export results anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}