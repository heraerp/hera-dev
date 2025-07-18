import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OpportunityCardProps {
  opportunity: any;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{opportunity.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">
          {opportunity.description}
        </p>
        <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
          {opportunity.status}
        </Badge>
      </CardContent>
    </Card>
  );
}