import { OpportunityCard } from './OpportunityCard';

interface OpportunityListProps {
  opportunitys: any[];
}

export function OpportunityList({ opportunitys }: OpportunityListProps) {
  if (opportunitys.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No opportunitys found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {opportunitys.map((opportunity) => (
        <OpportunityCard 
          key={opportunity.id} 
          opportunity={opportunity} 
        />
      ))}
    </div>
  );
}