'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button } from '@mui/material';
import MapView from '../components/MapView';
import { supabase } from '../lib/supabaseClient';
import EventFilter from '../components/EventFilter';
import ListView from '../components/ListView';  

interface Event {
  id: string;
  title: string;
  description: string;
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} onClick={() => setViewMode('list')}>List View</Button>
            <Button variant={viewMode === 'map' ? 'contained' : 'outlined'} onClick={() => setViewMode('map')}>Map View</Button>
          </Box>

          {viewMode === 'map' ? (
            <MapView events={filteredEvents.filter(e => e.latitude && e.longitude)} />
          ) : (
            <ListView events={filteredEvents} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
