'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EventsPage() {
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

  const { data: session } = useSession(); // access the user's session data (like their email)
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); //true if user is admin

  // only allows add event feature if logged in as admin, if not the button won't display
  useEffect(() => {
    async function checkAdminRole() {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      if (error) {
        console.error('Error checking admin role:', error.message);
        return;
      }

      setIsAdmin(data?.role === 'admin');
    }

    checkAdminRole();
  }, [session]);

  
  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {isAdmin && (
        // this button displays only if the user is an admin
        <Link href="/addEvent">
          <button className="bg-green-500 text-white p-2 rounded mb-4">
            Add Event
          </button>
        </Link>
      )}
      <h1>Upcoming Events</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(event => (
          <li key={event.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Location:</strong> {event.location} ({event.building_index})</p>
            <p><strong>Status:</strong> {event.status}</p>
            <p><strong>Created By:</strong> {event.created_by}</p>
            <p><strong>Created At:</strong> {new Date(event.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
