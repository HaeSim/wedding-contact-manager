'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
      const contacts = JSON.parse(storedContacts);
      if (Array.isArray(contacts) && contacts.length > 0) {
        // Find first contact without intimacy or group
        const incompleteIndex = contacts.findIndex(
          (contact) => !contact.intimacy || !contact.group
        );
        if (incompleteIndex !== -1) {
          router.push(`/review/${incompleteIndex + 1}`);
        } else {
          router.push('/review/1');
        }
      }
    }
  }, [router]);

  return null;
}
