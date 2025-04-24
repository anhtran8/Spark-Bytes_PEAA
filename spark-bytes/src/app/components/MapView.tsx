'use client';

import { useEffect, useRef } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  expires_at: string;
}

interface Props {
  events: Event[];
}

export default function MapView({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) {
      console.warn("Google Maps or mapRef not ready yet");
      return;
    }

    const initializeMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const map = new Map(mapRef.current!, {
          center: { lat: 42.3505, lng: -71.1054 },
          zoom: 15,
          mapId: '48d2baf4ae403307',
        });

        let openInfoWindow: google.maps.InfoWindow | null = null;

        events.forEach((event) => {
          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: event.latitude, lng: event.longitude },
            title: event.title,
          });

          const content = `
            <div style="max-width: 250px; font-family: sans-serif;">
              <h3 style="margin: 0 0 0.3rem 0;">${event.title}</h3>
              <p style="margin: 0 0 0.3rem 0; font-size: 0.9rem;">${event.description}</p>
              <p style="margin: 0; font-size: 0.8rem;">
                <strong>Status:</strong> ${event.status}<br />
                <strong>Ends:</strong> ${new Date(event.expires_at).toLocaleString()}
              </p>
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content,
          });

          const showInfoWindow = () => {
            if (openInfoWindow) openInfoWindow.close();
            infoWindow.open(map, marker);
            openInfoWindow = infoWindow;
          };

          marker.addListener("mouseover", showInfoWindow);
          marker.addListener("click", showInfoWindow);

          marker.addListener("mouseout", () => {
            if (window.matchMedia('(pointer: fine)').matches) {
              infoWindow.close();
              openInfoWindow = null;
            }
          });
        });
      } catch (error) {
        console.error("Map init error:", error);
      }
    };

    initializeMap();
  }, [events]);

  return (
    <div style={{ width: '100%', minHeight: '500px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
}
