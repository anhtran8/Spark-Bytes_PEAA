"use client";

import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logging in with", email, password);
    };

    return (
    <div>
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
        Login
        </h1>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.8',
        }}>
        </p>
        </main>

        <form onSubmit={handleSubmit}>
                <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
        </form>
        
        </div>
    );
}