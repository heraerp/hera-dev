import { ContactCard } from './ContactCard';

interface ContactListProps {
  contacts: any[];
}

export function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No contacts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <ContactCard 
          key={contact.id} 
          contact={contact} 
        />
      ))}
    </div>
  );
}