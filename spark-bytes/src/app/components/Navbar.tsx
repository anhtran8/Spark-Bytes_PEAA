'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';

    return (
        <nav style={{
            backgroundColor: '#c00', // Red BU tone
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
        }}>
            <div className="logo">
                <h2 style={{ margin: 0 }}>Spark! Bytes</h2>
            </div>
            <div style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <Link href="/home" style={{ color: 'white', textDecoration: 'none' }}>
                    Home
                </Link>
                
                {isLoggedIn && (
                    <Link href="/foods" style={{ color: 'white', textDecoration: 'none' }}>
                        Foods
                    </Link>
                )}

                <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>
                    About
                </Link>
                
                {isLoggedIn ? (
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
                ) : (
                    <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;