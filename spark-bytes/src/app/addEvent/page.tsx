'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import Script from 'next/script';

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

declare global {
  interface Window {
    google: typeof google;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: {
  maps: {
    importLibrary: (name: string) => Promise<any>; 
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

type PlacesLibrary = {
  PlaceAutocompleteElement: {
    new (): HTMLElement;
  };
};

/* eslint-disable @typescript-eslint/no-namespace */
// Define the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete-element': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export default function AddEvent() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('plenty'); 
  const [createdBy, setCreatedBy] = useState('');
  const [buildingIndex, setBuildingIndex] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [newFoodItem, setNewFoodItem] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const placeAutocompleteRef = useRef<HTMLElement | null>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email) {
      setCreatedBy(session.user.email);
    }
  }, [session]);

  // Initialize Google Maps when script is loaded
  // Only update the useEffect for Google Maps initialization
useEffect(() => {
  if (!isScriptLoaded || !locationContainerRef.current) return;

  const initGoogleMaps = async () => {
    try {
      // Import the places library
      const placesLib = await google.maps.importLibrary("places") as unknown as PlacesLibrary;
      console.log("Places library loaded", placesLib); // Debug log
      
      // Clear the container first
      if (locationContainerRef.current) {
        locationContainerRef.current.innerHTML = '';
        
        // Create a visible manual input for immediate feedback
        const input = document.createElement('input');
        input.placeholder = "Loading place search...";
        input.style.width = '100%';
        input.style.padding = '0.5rem';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        input.style.marginBottom = '10px';
        locationContainerRef.current.appendChild(input);
        
        // Use the direct instantiation method from Google's example
        const placeAutocomplete = new placesLib.PlaceAutocompleteElement();
        
        // Configure for campus buildings and addresses
        placeAutocomplete.dataset.types = JSON.stringify(['establishment', 'geocode']);
        
        // Add Boston University location bias
        placeAutocomplete.dataset.locationBias = JSON.stringify({
          southwest: { lat: 42.3473, lng: -71.1030 },
          northeast: { lat: 42.3531, lng: -71.0894 }
        });
        
        // Handle place selection using the pattern from Google's example
        placeAutocomplete.addEventListener('gmp-select', async (event: Event) => {
          const customEvent = event as CustomEvent<{
            placePrediction: {
              toPlace: () => {
                fetchFields: (args: { fields: string[] }) => Promise<void>;
              };
            };
          }>;
          const placePrediction = customEvent.detail.placePrediction;
          if (placePrediction) {
            const place = placePrediction.toPlace() as unknown as {
              fetchFields: (args: { fields: string[] }) => Promise<void>;
              toJSON: () => {
                formattedAddress?: string;
                displayName?: string;
                location?: {
                  lat: number;
                  lng: number;
                };
              };
            };
            await place.fetchFields({ 
              fields: ['displayName', 'formattedAddress', 'location'] 
            });
            
            // Update state with the place data
            const placeData = place.toJSON();
            console.log("Selected place:", placeData); // Debug log
            setLocation(placeData.formattedAddress || placeData.displayName || '');
            
            if (placeData.location) {
              setLatitude(placeData.location.lat.toString());
              setLongitude(placeData.location.lng.toString());
            }
          }
        });
        
        // Remove the temporary input and add the autocomplete element
        locationContainerRef.current.innerHTML = '';
        locationContainerRef.current.appendChild(placeAutocomplete);
        
        // Store reference for cleanup
        placeAutocompleteRef.current = placeAutocomplete;
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      
      // If there's an error, at least show a regular input field
      if (locationContainerRef.current) {
        locationContainerRef.current.innerHTML = '';
        const fallbackInput = document.createElement('input');
        fallbackInput.placeholder = "Enter location manually (autocomplete failed)";
        fallbackInput.style.width = '100%';
        fallbackInput.style.padding = '0.5rem';
        fallbackInput.style.border = '1px solid #ccc';
        fallbackInput.style.borderRadius = '4px';
        fallbackInput.value = location;
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
}, [isScriptLoaded, location]);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // Your existing handler functions remain the same
  const handleAddFoodItem = () => {
    if (newFoodItem.trim() !== '') {
      setFoodItems([...foodItems, newFoodItem.trim()]);
      setNewFoodItem('');
    }
  };

  const handleRemoveFoodItem = (index: number) => {
    const updatedFoodItems = [...foodItems];
    updatedFoodItems.splice(index, 1);
    setFoodItems(updatedFoodItems);
  };

  const handleDietaryPreferenceChange = (option: string) => {
    if (dietaryPreferences.includes(option)) {
      setDietaryPreferences(dietaryPreferences.filter(item => item !== option));
    } else {
      setDietaryPreferences([...dietaryPreferences, option]);
    }
  };

  const getCoordinatesFromAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        return { lat, lng };
      }
      return null;
    } catch (error) {
      alert('Error geocoding address');
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!title || !description || !location) {
        alert('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      if ((!latitude || !longitude) && location) {
        const coords = await getCoordinatesFromAddress(location);
        if (!coords) {
          alert('Could not determine coordinates for this location. Please try a different address.');
          setIsSubmitting(false);
          return;
        }
      }

      const lat = latitude ? parseFloat(latitude) : 0;
      const lng = longitude ? parseFloat(longitude) : 0;

      const eventData = {
        title,
        description,
        location,
        status,
        created_by: createdBy || 'anonymous',
        building_index: buildingIndex,
        latitude: lat,
        longitude: lng,
        foods: foodItems,
        dietary_preferences: dietaryPreferences,
      };

      const { error } = await supabase.from('events').insert([eventData]);
      if (error) {
        alert(`Failed to add event: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      alert('Event added successfully!');
      router.push('/events');
    } catch (err) {
      if (err instanceof Error) {
        alert(`Unexpected error: ${err.message}`);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`}
        onLoad={handleScriptLoad}
      />
      
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Add New Event</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
          <label>Location:</label>
          <div 
            ref={locationContainerRef} 
            style={{ 
              marginTop: '0.25rem',
              minHeight: '40px', // Add minimum height
              width: '100%',     // Ensure full width
              position: 'relative' // For proper positioning of dropdown
            }}
          >
            {/* The Google Maps PlaceAutocompleteElement will be inserted here */}
          </div>
          
          {location && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Selected: {location}
            </div>
          )}
        </div>

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

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="buildingIndex">Building Index:</label>
            <input
              type="text"
              id="buildingIndex"
              value={buildingIndex}
              onChange={(e) => setBuildingIndex(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Food Items:</label>
            <div style={{ display: 'flex', marginTop: '0.25rem' }}>
              <input
                type="text"
                value={newFoodItem}
                onChange={(e) => setNewFoodItem(e.target.value)}
                placeholder="Enter food item"
                style={{ 
                  flex: '1', 
                  padding: '0.5rem',
                  marginRight: '0.5rem' 
                }}
              />
              <button
                type="button"
                onClick={handleAddFoodItem}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>

            {foodItems.length > 0 && (
              <ul style={{ 
                listStyle: 'none', 
                padding: '0.5rem',
                marginTop: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                {foodItems.map((item, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    {item}
                    <button onClick={() => handleRemoveFoodItem(index)} style={{ marginLeft: '1rem', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Dietary Preferences:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {dietaryOptions.map((option) => (
                <label key={option} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={dietaryPreferences.includes(option)}
                    onChange={() => handleDietaryPreferenceChange(option)}
                    style={{ marginRight: '0.25rem' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </button>
        </form>
      </div>
    </>
  );
}