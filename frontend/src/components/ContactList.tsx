import React, { useEffect, useState } from 'react';
import Contact from './Contact';

interface ContactData {
  id: number;
  username: string;
  email: string;
}

const ContactList = () => {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // This would be replaced with your actual API endpoint
        const response = await fetch('http://localhost:8000/users');
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          // For development, use mock data if API returns an error
          setContacts([
            { id: 1, username: 'ken', email: 'ken@gmail.com' },
            { id: 2, username: 'amy', email: 'amy@gmail.com' },
            { id: 3, username: 'alex', email: 'alex@gmail.com' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        // Mock data for development
        setContacts([
          { id: 1, username: 'ken', email: 'ken@gmail.com' },
          { id: 2, username: 'amy', email: 'amy@gmail.com' },
          { id: 3, username: 'alex', email: 'alex@gmail.com' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading contacts...</div>;
  }

  if (contacts.length === 0) {
    return <div className="text-gray-500">No contacts yet.</div>;
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <Contact 
          key={contact.id} 
          name={contact.username} 
          email={contact.email} 
        />
      ))}
    </div>
  );
};

export default ContactList;