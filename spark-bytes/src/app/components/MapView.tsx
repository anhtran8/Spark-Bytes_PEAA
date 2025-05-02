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
  foods: string[];
  expires_at: string;
  dietary_preferences: string[];
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
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: event.latitude, lng: event.longitude },
          title: event.title,
        });

        // Create info window content
        const contentString = `
          <div style="max-width: 300px; padding: 10px;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p><strong>Expires:</strong> ${new Date(event.expires_at).toLocaleString()}</p>
            ${event.foods && event.foods.length > 0 ? 
              `<p><strong>Available Food:</strong> ${event.foods.join(', ')}</p>` : ''}
            ${event.dietary_preferences && event.dietary_preferences.length > 0 ? 
              `<p><strong>Dietary Options:</strong> ${event.dietary_preferences.join(', ')}</p>` : ''}
          </div>
        `;

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: contentString,
        });

        // Add click listener to show info window when marker is clicked
        marker.addListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map,
          });
        });
      });
    };

    initializeMap();
  }, [events]);

  return <Box ref={mapRef} sx={{ width: '100%', height: '100%', minHeight: '500px' }} />;
}