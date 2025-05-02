'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button } from '@mui/material';
import MapView from '../components/MapView';
import { supabase } from '../lib/supabaseClient';
import EventFilter from '../components/EventFilter';
import { useRouter } from 'next/navigation';

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
  going_count: number;
  foods: string[];
}

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const fetchEventsWithRsvpCounts = async () => {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('expires_at', { ascending: false });

      if (eventsError || !eventsData) {
        console.error(eventsError);
        setLoading(false);
        return;
      }

      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('event_id');

      if (rsvpError || !rsvpData) {
        console.error(rsvpError);
        setLoading(false);
        return;
      }

      const rsvpCounts = rsvpData.reduce<Record<string, number>>((acc, rsvp) => {
        acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1;
        return acc;
      }, {});

      const merged = eventsData.map(event => ({
        ...event,
        going_count: rsvpCounts[event.id] || 0,
      }));

      setEvents(merged);
      setAllEvents(merged);
      setLoading(false);
    };

    fetchEventsWithRsvpCounts();
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

  useEffect(() => {
    if (!loading && filter === 'current' && filteredEvents.length === 0) {
      setFilter('past');
    }
  }, [loading, filteredEvents, filter]);

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
                  {/* Display Food Items */}
                  {event.foods && event.foods.length > 0 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Typography component="div">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          {event.foods.map(item => (
                            <span
                              key={item}
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#fff3e0', // Light orange for food items
                                borderRadius: '16px',
                                padding: '4px 12px',
                                fontSize: '0.85rem',
                                border: '1px solid #ffe0b2'
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </Box>
                      </Typography>
                    </Box>
                  )}

                  {event.dietary_preferences && event.dietary_preferences.length > 0 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Typography component="div">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          {event.dietary_preferences.map(item => (
                            <span
                              key={item}
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '16px',
                                padding: '4px 12px',
                                fontSize: '0.85rem',
                                border: '1px solid #90caf9'
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </Box>
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isExpired(event.expires_at) ? (
                      <Button
                        variant="contained"
                        disabled
                        sx={{ backgroundColor: '#ccc', color: 'black' }}
                      >
                        Event Ended
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={async () => {
                          const userEmail = session?.user?.email;
                          if (!userEmail) return;

                          const { data: existingRsvp } = await supabase
                            .from('rsvps')
                            .select('id')
                            .eq('user_email', userEmail)
                            .eq('event_id', event.id)
                            .maybeSingle();

                          if (existingRsvp) {
                            alert('You’ve already RSVP’d to this event!');
                            return;
                          }

                          const { error } = await supabase
                            .from('rsvps')
                            .insert([{ event_id: event.id, user_email: userEmail }]);

                          if (!error) {
                            setEvents(prev =>
                              prev.map(e =>
                                e.id === event.id
                                  ? { ...e, going_count: (e.going_count || 0) + 1 }
                                  : e
                              )
                            );
                            setAllEvents(prev =>
                              prev.map(e =>
                                e.id === event.id
                                  ? { ...e, going_count: (e.going_count || 0) + 1 }
                                  : e
                              )
                            );
                          } else {
                            console.error(error);
                          }
                        }}
                      >
                        I’m Going
                      </Button>
                    )}
                    <Typography>{event.going_count || 0} going</Typography>
                  </Box>
                </li>
              ))}
            </ul>
          )}
        </Box>
      </Box>
    </Box>
  );
}
