'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
// import { useTheme } from '@mui/material/styles';
import {
  TextField,
  Button,
  Container,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { detectCampus } from '../lib/campusZones';

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

export default function AddEvent() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState('plenty');
  const [createdBy, setCreatedBy] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [newFoodItem, setNewFoodItem] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState<number>(60);
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [dynamicExpiresAt, setDynamicExpiresAt] = useState<string>('');

  const placeAutocompleteRef = useRef<HTMLElement | null>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // const theme = useTheme();

  useEffect(() => {
    if (session?.user?.email) {
      setCreatedBy(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        if (!window.google || !locationContainerRef.current) return;
        if (placeAutocompleteRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const placesLib = await window.google.maps.importLibrary("places") as any;

        locationContainerRef.current.innerHTML = '';
        const placeAutocomplete = new placesLib.PlaceAutocompleteElement();
        placeAutocomplete.dataset.types = JSON.stringify(['establishment', 'geocode']);
        placeAutocomplete.dataset.locationBias = JSON.stringify({
          southwest: { lat: 42.3473, lng: -71.1030 },
          northeast: { lat: 42.3531, lng: -71.0894 }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        locationContainerRef.current.appendChild(placeAutocomplete);
        placeAutocompleteRef.current = placeAutocomplete;
      } catch (error) {
        console.error('Google Maps init error:', error);
      }
    };

    initGoogleMaps();
  }, []);

  useEffect(() => {
    const now = new Date();
    const minutes = durationUnit === 'minutes' ? duration : duration * 60;
    now.setMinutes(now.getMinutes() + minutes);
    setDynamicExpiresAt(now.toISOString());
  }, [duration, durationUnit]);

  const handleRemoveFoodItem = (index: number) => {
    const updated = [...foodItems];
    updated.splice(index, 1);
    setFoodItems(updated);
  };

  const handleDietaryPreferenceChange = (option: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!title || !description || !location || !duration) {
        alert('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      const expiresAt = new Date();
      const durationInMinutes = durationUnit === 'minutes' ? duration : duration * 60;
      expiresAt.setMinutes(expiresAt.getMinutes() + durationInMinutes);

      const lat = latitude ? parseFloat(latitude) : 0;
      const lng = longitude ? parseFloat(longitude) : 0;
      const campus = detectCampus(lat, lng);

      const eventData = {
        title,
        description,
        location,
        status,
        created_by: createdBy || 'anonymous',
        latitude: lat,
        longitude: lng,
        campus,
        foods: foodItems,
        dietary_preferences: dietaryPreferences,
        duration_minutes: durationInMinutes,
        expires_at: expiresAt.toISOString(),
      };

      // Adding Notification feature
     // Insert the event into the events table and get the inserted row back
      const { data: insertedEvents, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();
      // Handle any error or missing data
      if (error || !insertedEvents || insertedEvents.length === 0) {
        throw error || new Error('Event not inserted.');
      }
      // Get the inserted event so we can reference its ID for the notification
      const insertedEvent = insertedEvents[0];
      // Insert a new row into the 'notifications' table with event details
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          title: insertedEvent.title,
          description: insertedEvent.description,
          event_id: insertedEvent.id,
        }]);
      // Handle any error from the notification insert
      if (notificationError) {
        console.error('Notification insert error:', notificationError);
        throw notificationError;
      }

      alert('Event added successfully!');
      router.push('/events');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Add New Event
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel shrink htmlFor="location-input">Location</InputLabel>
          <Box sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: '4px', minHeight: '56px', p: 2 }}>
            <div ref={locationContainerRef} />
          </Box>
          {location && <FormHelperText sx={{ mt: 1 }}>Selected: {location}</FormHelperText>}
        </FormControl>

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />

        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <TextField
            label="Duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            required
            inputProps={{ min: 1, max: 1440 }}
            sx={{ flex: 2 }}
          />
          <FormControl sx={{ width: '150px' }}>
            <InputLabel id="duration-unit-label">Unit</InputLabel>
            <Select
              labelId="duration-unit-label"
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours')}
              label="Unit"
            >
              <MenuItem value="minutes">Minutes</MenuItem>
              <MenuItem value="hours">Hours</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth margin="normal">
          <FormHelperText>Ends At: {new Date(dynamicExpiresAt).toLocaleString()}</FormHelperText>
        </FormControl>

        <Box sx={{ my: 2 }}>
          <TextField
            label="Food Item"
            value={newFoodItem}
            onChange={(e) => setNewFoodItem(e.target.value)}
            size="small"
            sx={{ mr: 2 }}
          />
          <Button onClick={() => { if (newFoodItem) { setFoodItems([...foodItems, newFoodItem]); setNewFoodItem(''); } }}>
            Add Food
          </Button>
        </Box>
        {foodItems.map((item, i) => (
          <Box key={i} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>{item}</Typography>
            <Button color="error" size="small" onClick={() => handleRemoveFoodItem(i)}>Remove</Button>
          </Box>
        ))}

        <Box sx={{ my: 3 }}>
          <Typography variant="h6">Dietary Preferences</Typography>
          {dietaryOptions.map(opt => (
            <Box key={opt} sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={dietaryPreferences.includes(opt)}
                onChange={() => handleDietaryPreferenceChange(opt)}
                id={`diet-${opt}`}
              />
              <label htmlFor={`diet-${opt}`} style={{ marginLeft: 8 }}>{opt}</label>
            </Box>
          ))}
        </Box>

        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Submitting...' : 'Add Event'}
        </Button>
      </form>
    </Container>
  );
}
