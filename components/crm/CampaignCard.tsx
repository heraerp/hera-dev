import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CampaignCardProps {
  campaign: any;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">
          {campaign.description}
        </p>
        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
          {campaign.status}
        </Badge>
      </CardContent>
    </Card>
  );
}