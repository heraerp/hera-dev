import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContactCardProps {
  contact: any;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">
          {contact.description}
        </p>
        <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
          {contact.status}
        </Badge>
      </CardContent>
    </Card>
  );
}