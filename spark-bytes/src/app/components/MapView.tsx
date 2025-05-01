/// <reference types="google.maps" />
'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface Event {
  id: string;
  title: string;
  description: string[];
  latitude: number;
  longitude: number;
}

interface Props {
  events: Event[];
}

export default function MapView({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initializeMap = async () => {
      const { Map } = await window.google.maps.importLibrary('maps') as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

      const map = new Map(mapRef.current!, {
        center: { lat: 42.3505, lng: -71.1054 },
        zoom: 15,
        mapId: '48d2baf4ae403307',
      });

      events.forEach(event => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: event.latitude, lng: event.longitude },
          title: event.title,
        });
      });
    };

    initializeMap();
  }, [events]);

  return <Box ref={mapRef} sx={{ width: '100%', height: '100%', minHeight: '500px' }} />;
}