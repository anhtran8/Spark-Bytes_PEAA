'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FoodsPage() {
  interface Food {
    id: number;
    name: string;
    dietary_restrictions?: string[];
    created_at: string;
  }

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFoods() {
      const { data, error } = await supabase.from('foods').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching foods:', error);
      } else {
        setFoods(data);
      }
      setLoading(false);
    }
    fetchFoods();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Available Food</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {foods.map(food => (
          <li key={food.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
            <h3>{food.name}</h3>
            {food.dietary_restrictions && food.dietary_restrictions.length > 0 && (
              <p>Dietary Restrictions: {food.dietary_restrictions.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}