/**
 * Universal Form Builder Core Component
 * Lazy-loaded core functionality for better bundle optimization
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Sparkles,
  Zap,
  Database,
  FileText,
  User,
  Package,
  Users,
  Building
} from 'lucide-react';

export default function UniversalFormBuilderCore() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Universal Form Builder
            </h1>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-white">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionary AI-powered form building system that adapts to ANY business requirement. 
            Generate schemas, create forms, and manage data with zero configuration.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              Real-time AI Generation
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Database className="h-4 w-4 mr-1" />
              Universal Schema
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <FileText className="h-4 w-4 mr-1" />
              Dynamic Forms
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { value: '100%', label: 'Universal Compatibility', icon: Database },
            { value: '< 30s', label: 'Schema Generation', icon: Zap },
            { value: '95%', label: 'Accuracy Rate', icon: Brain },
            { value: '∞', label: 'Entity Types', icon: Package }
          ].map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Examples */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Choose Your Business Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Customer Management', icon: User, color: 'from-blue-500 to-indigo-600' },
              { title: 'Invoice Processing', icon: FileText, color: 'from-green-500 to-emerald-600' },
              { title: 'Product Catalog', icon: Package, color: 'from-purple-500 to-indigo-600' },
              { title: 'Employee Management', icon: Users, color: 'from-orange-500 to-red-600' },
              { title: 'Project Management', icon: Building, color: 'from-teal-500 to-cyan-600' },
              { title: 'Restaurant Menu', icon: FileText, color: 'from-amber-500 to-orange-600' }
            ].map((example, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${example.color} flex items-center justify-center mb-4`}>
                    <example.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{example.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    Try This Example
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Ready to Build Your Universal Form?
          </h3>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Brain className="h-5 w-5 mr-2" />
            Start Building Now
          </Button>
        </div>
      </div>
    </div>
  );
}