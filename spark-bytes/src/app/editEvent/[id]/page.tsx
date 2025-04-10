'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

const validStatuses = ['plenty', 'running out', 'gone'];

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete-element': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
/* eslint-disable @typescript-eslint/no-namespace */

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('plenty');
  const [buildingIndex, setBuildingIndex] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [newFoodItem, setNewFoodItem] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const locationContainerRef = useRef<HTMLDivElement>(null);
  const placeAutocompleteRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert('Error loading event');
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setStatus(validStatuses.includes(data.status) ? data.status : 'plenty');
      setBuildingIndex(data.building_index);
      setLocation(data.location);
      setLatitude(data.latitude?.toString() || '');
      setLongitude(data.longitude?.toString() || '');
      setFoodItems(data.foods || []);
      setDietaryPreferences(data.dietary_preferences || []);
      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!isScriptLoaded || !locationContainerRef.current) return;
/* eslint-disable @typescript-eslint/no-explicit-any */
    const initGoogleMaps = async () => {
      try {
        const placesLib = await google.maps.importLibrary("places") as any;

        locationContainerRef.current!.innerHTML = '';

        const placeAutocomplete = new placesLib.PlaceAutocompleteElement();
        placeAutocomplete.dataset.types = JSON.stringify(['establishment', 'geocode']);
        placeAutocomplete.dataset.locationBias = JSON.stringify({
          southwest: { lat: 42.3473, lng: -71.1030 },
          northeast: { lat: 42.3531, lng: -71.0894 }
        });

        placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }: any) => {
          if (placePrediction) {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
            const placeData = place.toJSON();
            setLocation(placeData.formattedAddress || placeData.displayName || '');
            if (placeData.location) {
              setLatitude(placeData.location.lat.toString());
              setLongitude(placeData.location.lng.toString());
            }
          }
        });
/* eslint-disable @typescript-eslint/no-explicit-any */

        locationContainerRef.current!.innerHTML = '';
        locationContainerRef.current!.appendChild(placeAutocomplete);
        placeAutocompleteRef.current = placeAutocomplete;

      } catch (error) {
        console.error('Google Maps init error:', error);

        // Fallback input
        if (locationContainerRef.current) {
          locationContainerRef.current.innerHTML = '';
          const fallbackInput = document.createElement('input');
          fallbackInput.placeholder = "Enter location manually";
          fallbackInput.value = location;
          fallbackInput.style.width = '100%';
          fallbackInput.style.padding = '0.5rem';
          fallbackInput.style.border = '1px solid #ccc';
          fallbackInput.style.borderRadius = '4px';
          fallbackInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            setLocation(target.value);
          });
          locationContainerRef.current.appendChild(fallbackInput);
        }
      }
    };

    initGoogleMaps();

    return () => {
      if (placeAutocompleteRef.current) {
        placeAutocompleteRef.current.removeEventListener('gmp-select', () => {});
      }
    };
  }, [isScriptLoaded]);

  const handleScriptLoad = () => setIsScriptLoaded(true);

  const handleAddFoodItem = () => {
    if (newFoodItem.trim()) {
      setFoodItems([...foodItems, newFoodItem.trim()]);
      setNewFoodItem('');
    }
  };

  const handleRemoveFoodItem = (index: number) => {
    const updated = [...foodItems];
    updated.splice(index, 1);
    setFoodItems(updated);
  };

  const handleDietaryPreferenceChange = (option: string) => {
    if (dietaryPreferences.includes(option)) {
      setDietaryPreferences(dietaryPreferences.filter(item => item !== option));
    } else {
      setDietaryPreferences([...dietaryPreferences, option]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const lat = latitude ? parseFloat(latitude) : 0;
      const lng = longitude ? parseFloat(longitude) : 0;

      const update = {
        title,
        description,
        location,
        status,
        building_index: buildingIndex,
        latitude: lat,
        longitude: lng,
        foods: foodItems,
        dietary_preferences: dietaryPreferences,
      };

      const { error } = await supabase.from('events').update(update).eq('id', id);
      if (error) throw error;

      alert('Event updated!');
      router.push('/myEvents');
    } catch (err) {
      alert(`Failed to update event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`}
        onLoad={handleScriptLoad}
      />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Edit Event</h1>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Location:</label>
          <div ref={locationContainerRef} style={{ minHeight: '40px', marginBottom: '0.5rem' }} />
          {location && <div style={{ fontSize: '0.9rem', color: '#666' }}>Selected: {location}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="status">Food Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="plenty">Plenty</option>
              <option value="running out">Running Out</option>
              <option value="gone">Gone</option>
            </select>
          </div>

          <label>Building Index:</label>
          <input value={buildingIndex} onChange={e => setBuildingIndex(e.target.value)} required style={{ width: '100%', marginBottom: '1rem' }} />

          <label>Food Items:</label>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <input value={newFoodItem} onChange={e => setNewFoodItem(e.target.value)} placeholder="Enter food item" style={{ flex: 1, marginRight: '0.5rem' }} />
            <button type="button" onClick={handleAddFoodItem}>+</button>
          </div>
          {foodItems.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '0.3rem' }}>
              {item}
              <button type="button" onClick={() => handleRemoveFoodItem(idx)} style={{ marginLeft: '1rem', color: 'red' }}>&times;</button>
            </div>
          ))}

          <label>Dietary Preferences:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {dietaryOptions.map(option => (
              <label key={option}>
                <input type="checkbox" checked={dietaryPreferences.includes(option)} onChange={() => handleDietaryPreferenceChange(option)} />
                {option}
              </label>
            ))}
          </div>

          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}
