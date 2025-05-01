'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Show loading state
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>      
      <main style={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h1>Welcome, {session?.user?.name || 'User'}!</h1>
        <p>You are now logged in to Spark! Bytes.</p>
        
        {/* Add your app content here */}
      </main>
    </div>
  );
}