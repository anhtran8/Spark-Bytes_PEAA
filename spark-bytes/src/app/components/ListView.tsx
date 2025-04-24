'use client';

import { Typography } from '@mui/material';

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

export default function ListView({ events }: { events: Event[] }) {
  const isExpired = (date: string) => new Date() > new Date(date);

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {events.map(event => (
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
  );
}