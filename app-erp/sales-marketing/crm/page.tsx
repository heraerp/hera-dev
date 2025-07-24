'use client';

import { useState } from 'react';
import { useCRM } from '@/hooks/useCRM';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CRMAnalytics } from '@/components/crm/CRMAnalytics';
import { ContactList } from '@/components/crm/ContactList';
import { OpportunityList } from '@/components/crm/OpportunityList';
import { CampaignList } from '@/components/crm/CampaignList';

// Mock organization ID - replace with real auth
const ORGANIZATION_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

export default function CRMPage() {
  const {
    contacts,
    analytics,
    aiInsights,
    loading,
    error,
    generateAIInsights,
    totalContacts,
    activeContacts
  } = useCRM(ORGANIZATION_ID);

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Management</h1>
          <p className="text-muted-foreground">
            Business modules (CRM, Sales, Marketing)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {totalContacts} Total
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {activeContacts} Active
          </Badge>
          <Button onClick={generateAIInsights}>
            Generate AI Insights
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              CONVERSION RATE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.conversion_rate || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              PIPELINE VALUE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.pipeline_value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              CUSTOMER ACQUISITION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.customer_acquisition || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="opportunitys">Opportunitys</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Latest AI-generated insights for your crm operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiInsights.length > 0 ? (
                <div className="space-y-2">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click "Generate AI Insights" to get intelligent recommendations.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ContactList contacts={contacts} />
        </TabsContent>
        <TabsContent value="opportunitys" className="space-y-4">
          <OpportunityList opportunitys={contacts} />
        </TabsContent>
        <TabsContent value="campaigns" className="space-y-4">
          <CampaignList campaigns={contacts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CRMAnalytics analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}