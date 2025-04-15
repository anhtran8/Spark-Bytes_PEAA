'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import Script from 'next/script';
import { useTheme } from '@mui/material/styles';
import { TextField, Button, Container, FormControl, InputLabel, OutlinedInput, FormHelperText } from '@mui/material';

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

// Define the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete-element': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

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
  const [duration, setDuration] = useState(60);
  const [durationUnit, setDurationUnit] = useState('minutes');  

  const placeAutocompleteRef = useRef<HTMLElement | null>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (session?.user?.email) {
      setCreatedBy(session.user.email);
    }
  }, [session]);

  // Initialize Google Maps when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !locationContainerRef.current) return;

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

      let expiresAt = new Date();

      const durationInMinutes = durationUnit === 'minutes' ? duration : duration * 60;
      expiresAt.setMinutes(expiresAt.getMinutes() + durationInMinutes);

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
        duration_minutes: durationInMinutes,
        expires_at: expiresAt.toISOString(),
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
      
      <Container>
        <h1>Add New Event</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel shrink htmlFor="location-input">Location</InputLabel>
            <div
              style={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                padding: '0',
                position: 'relative',
                minHeight: '56px',
              }}
            >
              <div
                ref={locationContainerRef}
                style={{ 
                  width: '100%',
                  padding: '16.5px 14px',
                  minHeight: '1.4375em'
                }}
              />
            </div>
            {location && (
              <FormHelperText>Selected: {location}</FormHelperText>
            )}
          </FormControl>
  
          <div style={{ display: 'flex', alignItems: 'center', gap: '1 rem' }}>
            <TextField
              label="Duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              variant="outlined"
              size="small"
              required
              inputProps={{
                min: 1, // Min value for input
                max: 1440, // Max value for input
              }}
            />
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
            required
          />
          
          <div>
            <div>
              <TextField
                label="Food Item"
                variant="outlined"
                size="small"
                value={newFoodItem}
                onChange={(e) => setNewFoodItem(e.target.value)}
                sx={{ marginRight: 1 }}
              />
              <Button onClick={handleAddFoodItem}>Add Food</Button>
              <div className="foodItemsContainer">
                {foodItems.map((item, index) => (
                  <div key={index} className="foodItemBox">
                    {item}
                    <Button
                      onClick={() => handleRemoveFoodItem(index)}
                      sx={{ 
                        padding: '2px 6px',
                        fontSize: '1 rem',
                        borderRadius: '6px',
                        textTransform: 'none',
                        minWidth: 'unset'
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label>Dietary Preferences:</label>
            {dietaryOptions.map((option) => (
              <div key={option}>
                <input
                  type="checkbox"
                  checked={dietaryPreferences.includes(option)}
                  onChange={() => handleDietaryPreferenceChange(option)}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>

          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            Add Event
          </Button>
        </form>
      </Container>
    </>
  );
}
