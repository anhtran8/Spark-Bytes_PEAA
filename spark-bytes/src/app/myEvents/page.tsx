'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, Select, MenuItem } from '@mui/material';

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
    expires_at: string;
  }

  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'current' | 'past'>('current');

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
        setEvents(data || []);
      }
      setLoading(false);
    }

    fetchMyEvents();
  }, [session]);

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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Events</Typography>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'current' | 'past')}
          sx={{
            minWidth: 150,
          }}
        >
          <MenuItem value="current">Current Events</MenuItem>
          <MenuItem value="past">Past Events</MenuItem>
        </Select>
      </Box>

      {/* Add Event Button */}
      {session && (
        <Button
          onClick={() => router.push('/addEvent')}
          variant="contained"
          color="error"
          sx={{ mb: 3 }}
        >
          Add Event
        </Button>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredEvents.map((event) => (
          <li key={event.id} style={{
            borderBottom: '1px solid #ddd', 
            padding: '1rem 0', 
            backgroundColor: isExpired(event.expires_at) ? '#f0f0f0' : 'white', // Gray out expired events
            opacity: isExpired(event.expires_at) ? 0.6 : 1, // Reduce opacity for expired events
          }}>
            <Typography variant="h6">{event.title}</Typography>
            <Typography>{event.description}</Typography>
            <Typography>
              <strong>Location:</strong> {event.location} ({event.building_index})
            </Typography>
            <Typography>
              <strong>Status:</strong> {event.status}
            </Typography>
            <Typography>
              <strong>Created At:</strong> {new Date(event.created_at).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Ends At:</strong> {new Date(event.expires_at).toLocaleString()}
            </Typography>

            {/* Edit Event Button */}
            <Button
              onClick={() => router.push(`/editEvent/${event.id}`)}
              variant="outlined"
              color="error"
              sx={{ mt: 2 }}
            >
              Edit Event
            </Button>
          </li>
        ))}
      </ul>
    </Box>
  );
}
