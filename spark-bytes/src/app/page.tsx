'use client';

import Link from 'next/link';

export default function Home() {
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
        <div>
          <Link href="/login" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>
            Log In
          </Link>
        </div>
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
      </main>
    </div>
  );
}
