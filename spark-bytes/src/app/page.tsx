'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
    
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: '#c00', // Red BU tone
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <h2 style={{ margin: 0 }}>Spark! Bytes</h2>
      </nav>

      {/* Main Content */}
      <main style={{
        backgroundColor: '#fff',
        color: '#000',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '1rem',
          color: '#c00',
        }}>
          Welcome to Spark! Bytes
        </h1>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.8',
        }}>
          <strong style={{ color: '#c00' }}>Spark Bytes</strong> is a platform for Boston University students and faculty members to
          post events that provide foods or snacks. The aim is to reduce food waste
          resulting from over-purchasing for events and at the same time, help students
          access free food.
        </p>
        {/* Google Sign In Button */}
        <button 
          onClick={() => signIn("google", { 
            callbackUrl: "/home"
          })}
          style={{
            backgroundColor: '#c00',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '1rem 0'
          }}
          >
          Sign in with Google
        </button>
      </main>
    </div>
  );
}
