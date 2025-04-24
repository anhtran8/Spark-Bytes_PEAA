import { Box, Typography, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import React from 'react';

interface EventFilterProps {
  filter: 'current' | 'past';
  setFilter: (filter: 'current' | 'past') => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  selectedDiet: string | null;
  setSelectedDiet: (diet: string | null) => void;
  selectedCampus: string | null;
  setSelectedCampus: (campus: string | null) => void;
  allEvents: any[];
  applyFilters: () => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  filter,
  setFilter,
  selectedLocation,
  setSelectedLocation,
  selectedDiet,
  setSelectedDiet,
  selectedCampus,
  setSelectedCampus,
  allEvents,
  applyFilters
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="filter-type-label">Event Time</InputLabel>
        <Select
          labelId="filter-type-label"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'current' | 'past')}
        >
          <MenuItem value="current">Current Events</MenuItem>
          <MenuItem value="past">Past Events</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="location-filter-label">Location</InputLabel>
        <Select
          labelId="location-filter-label"
          value={selectedLocation || ''}
          onChange={(e) => setSelectedLocation(e.target.value || null)}
        >
          <MenuItem value="">All Locations</MenuItem>
          {[...new Set(allEvents.map(e => e.location))].map(loc => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="diet-filter-label">Dietary Preference</InputLabel>
        <Select
          labelId="diet-filter-label"
          value={selectedDiet || ''}
          onChange={(e) => setSelectedDiet(e.target.value || null)}
        >
          <MenuItem value="">All Preferences</MenuItem>
          {[...new Set(allEvents.flatMap(e => e.dietary_preferences))].map(diet => (
            <MenuItem key={diet} value={diet}>{diet}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="campus-filter-label">Campus</InputLabel>
        <Select
          labelId="campus-filter-label"
          value={selectedCampus || ''}
          onChange={(e) => setSelectedCampus(e.target.value || null)}
        >
          <MenuItem value="">All Campuses</MenuItem>
          {[...new Set(allEvents.map(e => e.campus))].map(campus => (
            <MenuItem key={campus} value={campus}>{campus}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
    </Box>
  );
};

export default EventFilter;
