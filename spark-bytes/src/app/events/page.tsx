'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Box, Typography, Select, MenuItem, Button } from '@mui/material';

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
  const [isAdmin, setIsAdmin] = useState(false); // true if user is admin
  const [filter, setFilter] = useState<'current' | 'past'>('current');

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
      return !isExpired(event.expires_at) && event.status.toLowerCase() !== 'gone';
    } else {
      return isExpired(event.expires_at) || event.status.toLowerCase() === 'gone';
    }
  });

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Events</Typography>
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
          <Button
            variant="contained"
            color="success"
            sx={{ mb: 4 }}
          >
            Add Event
          </Button>
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
            <Typography variant="h6">{event.title}</Typography>
            <Typography>{event.description}</Typography>
            <Typography>
              <strong>Location:</strong> {event.location} ({event.building_index})
            </Typography>
            <Typography>
              <strong>Status:</strong> {event.status}
            </Typography>
            <Typography>
              <strong>Ends At:</strong> {new Date(event.expires_at).toLocaleString()}
            </Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
}
