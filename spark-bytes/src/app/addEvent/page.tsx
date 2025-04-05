'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [buildingIndex, setBuildingIndex] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation can be added here

    // Call the API to add the event
    // For this example, we'll simply log the event to the console
    const eventData = {
      title,
      description,
      location,
      status,
      created_by: createdBy,
      building_index: buildingIndex,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    console.log('Event Data:', eventData);

    // POST request to API here 

    // Example:
    // const { data, error } = await supabase.from('events').insert([eventData]);

    // Redirect back to events page after successful submission
    router.push('/events'); 
  };

  return (
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
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="createdBy">Created By:</label>
          <input
            type="text"
            id="createdBy"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
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
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Add Event
        </button>
      </form>
    </div>
  );
}
