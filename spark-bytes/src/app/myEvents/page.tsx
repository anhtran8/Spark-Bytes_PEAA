'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MyEventsPage() {
  interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    building_index: string;
    latitude: number;
    longitude: number;
    status: string;
    created_by: string;
    created_at: string;
  }

  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyEvents() {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', session.user.email) // Filter by the logged-in user's email
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user-created events:', error.message);
      } else {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchMyEvents();
  }, [session]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (events.length === 0) {
    return <p>No events created by you yet.</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Events</h1>
      {/* Add Event Button */}
      {session && (
        <button
          onClick={() => router.push('/addEvent')} // Redirect to the Add Event page
          style={{
            backgroundColor: '#c00',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Add Event
        </button>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(event => (
          <li key={event.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Location:</strong> {event.location} ({event.building_index})</p>
            <p><strong>Status:</strong> {event.status}</p>
            <p><strong>Created At:</strong> {new Date(event.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}