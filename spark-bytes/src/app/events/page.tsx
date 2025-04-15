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
    dietary_preferences: Array<string>;
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
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null); // state to store selected location
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null); // state to store selected dietary preference
  const [allEvents, setAllEvents] = useState<Event[]>([]); // state to store all events

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
        setAllEvents(data); // store all events for filtering
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
      <div>
        <h2>Search for events</h2>
        <label htmlFor="location">Location:</label>
        <select
          id="location"
          value={selectedLocation || ''}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ marginLeft: '0.5rem', marginBottom: '1rem' }}
        >
          <option value="">All Locations</option> 
          {[...new Set(allEvents.map(event => event.location))].map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <br />
        <label htmlFor="diet">Dietary Preference:</label>
        <select
          id="diet"
          value={selectedDiet || ''}
          onChange={(e) => setSelectedDiet(e.target.value)}
          style={{ marginLeft: '0.5rem', marginBottom: '1rem' }}
        >
          <option value="">All Dietary Preferences</option>
          {[...new Set(allEvents.flatMap(event => event.dietary_preferences))].map((diet) => (
            <option key={diet} value={diet}>
              {diet}
            </option>  
          ))}
        </select>
        <br />
        <button
          onClick={() => {
            const filteredEvents = allEvents.filter(event => {
              const matchesLocation = selectedLocation ? event.location === selectedLocation : true;
              const matchesDiet = selectedDiet ? event.dietary_preferences.includes(selectedDiet) : true;
              return matchesLocation && matchesDiet;
            });
            setEvents(filteredEvents);
          }}
          style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Search
        </button>
      </div>
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
