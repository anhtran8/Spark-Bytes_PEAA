'use client';

import { useSession, signOut } from 'next-auth/react';
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
      <nav style={{
        backgroundColor: '#c00', // Red BU tone
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <h2 style={{ margin: 0 }}>Spark! Bytes</h2>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '5px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </nav>
      
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