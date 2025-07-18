import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CRMAnalyticsProps {
  analytics: any;
}

export function CRMAnalytics({ analytics }: CRMAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              CONVERSION RATE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.conversion_rate || 0}
            </div>
            <Progress value={analytics.conversion_rate || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              PIPELINE VALUE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.pipeline_value || 0}
            </div>
            <Progress value={analytics.pipeline_value || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              CUSTOMER ACQUISITION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.customer_acquisition || 0}
            </div>
            <Progress value={analytics.customer_acquisition || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Summary</CardTitle>
          <CardDescription>
            Generated at {analytics.generatedAt ? new Date(analytics.generatedAt).toLocaleString() : 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Period:</strong> {analytics.period}</p>
            <p><strong>Total Metrics:</strong> 3</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}