'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';
import { detectCampus } from '../../lib/campusZones';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

const validStatuses = ['plenty', 'running out', 'gone'];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete-element': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('plenty');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [campus, setCampus] = useState('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [newFoodItem, setNewFoodItem] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [dynamicExpiresAt, setDynamicExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setLocation(data.location);
      setLatitude(data.latitude?.toString() || '');
      setLongitude(data.longitude?.toString() || '');
      setCampus(data.campus || detectCampus(data.latitude, data.longitude));
      setFoodItems(data.foods || []);
      setDietaryPreferences(data.dietary_preferences || []);
      setExpiresAt(data.expires_at);

      if (data.duration_minutes) {
        const durationInMinutes = data.duration_minutes;
        if (durationInMinutes >= 60 && durationInMinutes % 60 === 0) {
          setDuration(durationInMinutes / 60);
          setDurationUnit('hours');
        } else {
          setDuration(durationInMinutes);
          setDurationUnit('minutes');
        }
      }

      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const now = new Date();
    const minutes = durationUnit === 'minutes' ? duration : duration * 60;
    now.setMinutes(now.getMinutes() + minutes);
    setDynamicExpiresAt(now.toISOString());
  }, [duration, durationUnit]);

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const placesLib = await google.maps.importLibrary("places") as any;

        if (!locationContainerRef.current) return;

        locationContainerRef.current.innerHTML = '';

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
              const lat = placeData.location.lat;
              const lng = placeData.location.lng;
              setLatitude(lat.toString());
              setLongitude(lng.toString());
              setCampus(detectCampus(lat, lng));
            }
          }
        });

        locationContainerRef.current.appendChild(placeAutocomplete);
        placeAutocompleteRef.current = placeAutocomplete;
      } catch (error) {
        console.error('Google Maps init error:', error);
      }
    };

    if (!placeAutocompleteRef.current && window.google && window.google.maps) {
      initGoogleMaps();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const lat = latitude ? parseFloat(latitude) : 0;
      const lng = longitude ? parseFloat(longitude) : 0;
      const durationInMinutes = durationUnit === 'minutes' ? duration : duration * 60;

      const update = {
        title,
        description,
        location,
        status,
        latitude: lat,
        longitude: lng,
        campus,
        foods: foodItems,
        dietary_preferences: dietaryPreferences,
        duration_minutes: durationInMinutes,
        expires_at: dynamicExpiresAt
      };

      const { error } = await supabase.from('events').update(update).eq('id', id);
      if (error) throw error;

      alert('Event updated successfully!');
      router.push('/myEvents');
    } catch (err) {
      alert(`Failed to update event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Edit Event
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

        {dynamicExpiresAt && (
          <FormHelperText sx={{ mt: 1, mb: 3 }}>Ends At: {new Date(dynamicExpiresAt).toLocaleString()} — Campus: {campus}</FormHelperText>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Food Items</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
          <TextField
            label="Food Item"
            value={newFoodItem}
            onChange={(e) => setNewFoodItem(e.target.value)}
            size="small"
            sx={{ mr: 2 }}
          />
          <Button onClick={() => {
            if (newFoodItem) {
              setFoodItems([...foodItems, newFoodItem]);
              setNewFoodItem('');
            }
          }}>Add Food</Button>
        </Box>
        {foodItems.map((item, i) => (
          <Box key={i} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>{item}</Typography>
            <Button color="error" size="small" onClick={() => {
              const updated = [...foodItems];
              updated.splice(i, 1);
              setFoodItems(updated);
            }}>Remove</Button>
          </Box>
        ))}

        <Box sx={{ my: 3 }}>
          <Typography variant="h6">Dietary Preferences</Typography>
          {dietaryOptions.map(opt => (
            <Box key={opt} sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={dietaryPreferences.includes(opt)}
                onChange={() => setDietaryPreferences(prev =>
                  prev.includes(opt)
                    ? prev.filter(item => item !== opt)
                    : [...prev, opt]
                )}
                id={`diet-${opt}`}
              />
              <label htmlFor={`diet-${opt}`} style={{ marginLeft: 8 }}>{opt}</label>
            </Box>
          ))}
        </Box>

        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Container>
  );
}
