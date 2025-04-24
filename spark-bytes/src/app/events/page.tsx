'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button } from '@mui/material';
import MapView from '../components/MapView';
import { supabase } from '../lib/supabaseClient';
import EventFilter from '../components/EventFilter';

interface Event {
  id: string;
  title: string;
  description: string[];
  dietary_preferences: string[];
  location: string;
  latitude: number;
  longitude: number;
  campus: string;
  status: string;
  expires_at: string;
}

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'current' | 'past'>('current');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()
      .then(({ data }) => {
        if (data?.role === 'admin') setIsAdmin(true);
      });
  }, [session]);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('expires_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setEvents(data);
          setAllEvents(data);
        }
        setLoading(false);
      });
  }, []);

  const isExpired = (date: string) => new Date() > new Date(date);

  const filteredEvents = events.filter(event => {
    const validTime =
      filter === 'current'
        ? !isExpired(event.expires_at) && event.status.toLowerCase() !== 'gone'
        : isExpired(event.expires_at) || event.status.toLowerCase() === 'gone';
    const matchLoc = selectedLocation ? event.location === selectedLocation : true;
    const matchDiet = selectedDiet ? event.dietary_preferences.includes(selectedDiet) : true;
    const matchCampus = selectedCampus ? event.campus === selectedCampus : true;
    return validTime && matchLoc && matchDiet && matchCampus;
  });

  const sortByNearest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLat, longitude: userLng } = position.coords;
        const sorted = [...filteredEvents].sort((a, b) => {
          const distA = Math.hypot(userLat - a.latitude, userLng - a.longitude);
          const distB = Math.hypot(userLat - b.latitude, userLng - b.longitude);
          return distA - distB;
        });
        setEvents(sorted);
      },
      (error) => {
        alert('Unable to retrieve your location');
        console.error(error);
      }
    );
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ padding: 4, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Events</Typography>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Sidebar Filter */}
        <Box sx={{ width: 300 }}>
          <EventFilter
            filter={filter}
            setFilter={setFilter}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedDiet={selectedDiet}
            setSelectedDiet={setSelectedDiet}
            selectedCampus={selectedCampus}
            setSelectedCampus={setSelectedCampus}
            allEvents={allEvents}
            applyFilters={() => {
              const filtered = allEvents.filter(event => {
                const locMatch = selectedLocation ? event.location === selectedLocation : true;
                const dietMatch = selectedDiet ? event.dietary_preferences.includes(selectedDiet) : true;
                const campusMatch = selectedCampus ? event.campus === selectedCampus : true;
                return locMatch && dietMatch && campusMatch;
              });
              setEvents(filtered);
            }}
          />
        </Box>

        {/* Main View */}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
            <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} onClick={() => setViewMode('list')}>List View</Button>
            <Button variant={viewMode === 'map' ? 'contained' : 'outlined'} onClick={() => setViewMode('map')}>Map View</Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="outlined" onClick={sortByNearest}>Sort: Nearest</Button>
          </Box>

          {viewMode === 'map' ? (
            <MapView events={filteredEvents.filter(e => e.latitude && e.longitude)} />
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredEvents.map(event => (
                <li key={event.id} style={{
                  borderBottom: '1px solid #ddd',
                  padding: '1rem 0',
                  backgroundColor: isExpired(event.expires_at) ? '#f0f0f0' : 'white',
                  opacity: isExpired(event.expires_at) ? 0.6 : 1,
                }}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography>{event.description}</Typography>
                  <Typography><strong>Location:</strong> {event.location}</Typography>
                  <Typography><strong>Campus:</strong> {event.campus}</Typography>
                  <Typography><strong>Status:</strong> {event.status}</Typography>
                  <Typography><strong>Ends:</strong> {new Date(event.expires_at).toLocaleString()}</Typography>
                </li>
              ))}
            </ul>
          )}
        </Box>
      </Box>
    </Box>
  );
}
