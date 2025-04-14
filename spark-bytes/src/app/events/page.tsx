'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


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
    expires_at: string;
  }

  const { data: session } = useSession(); // access the user's session data (like their email)
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); //true if user is admin
  const [filter, setFilter] = useState<'current' | 'past'>('current');

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
        .order('expires_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const isExpired = (expiresAt: string): boolean => {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now > expirationDate;
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'current') {
      // Include events that are not expired and do not have the status "gone"
      return !isExpired(event.expires_at) && event.status.toLowerCase() !== 'gone';
    } else {
      // Include events that are expired or have the status "gone"
      return isExpired(event.expires_at) || event.status.toLowerCase() === 'gone';
    }
  });

  if (loading) return <p>Loading...</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Events</Typography>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'current' | 'past')}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="current">Current Events</MenuItem>
          <MenuItem value="past">Past Events</MenuItem>
        </Select>
      </Box>
      {isAdmin && (
        <Link href="/addEvent">
          <button className="bg-green-500 text-white p-2 rounded mb-4">
            Add Event
          </button>
        </Link>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredEvents.map((event) => (
          <li
            key={event.id}
            style={{
              borderBottom: '1px solid #ddd',
              padding: '1rem 0',
              backgroundColor: isExpired(event.expires_at) ? '#f0f0f0' : 'white', // Grey out past events
              opacity: isExpired(event.expires_at) ? 0.6 : 1, // Reduce opacity for past events
            }}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              <strong>Location:</strong> {event.location} ({event.building_index})
            </p>
            <p>
              <strong>Status:</strong> {event.status}
            </p>
            <p>
              <strong>Expires At:</strong> {new Date(event.expires_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </Box>

    
  );
}
