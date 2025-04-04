'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    Avatar,
    Button,
    Menu,
    MenuItem,
    Typography,
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
    'Halal', 'Kosher', 'No Pork', 'Low Sugar'
];

const Navbar = () => {
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuView, setMenuView] = useState<'main' | 'dietary'>('main');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const open = Boolean(anchorEl);

    // Fetch dietary preferences when the user logs in
    useEffect(() => {
        const fetchDietaryPreferences = async () => {
            if (session?.user?.email) {
                const { data, error } = await supabase
                    .from('users')
                    .select('dietary_preferences')
                    .eq('email', session.user.email)
                    .single();

                if (error) {
                    console.error("Failed to fetch dietary preferences:", error.message);
                    return;
                }

                if (data?.dietary_preferences) {
                    setSelectedOptions(data.dietary_preferences);
                }
            }
        };

        if (isLoggedIn) {
            fetchDietaryPreferences();
        }
    }, [session, isLoggedIn]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setMenuView('main');
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuView('main');
    };

    const handleChange = (option: string) => {
        setSelectedOptions((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const handleSavePreferences = async () => {
        if (!session?.user?.email) return;

        const { error } = await supabase
            .from('users')
            .update({ dietary_preferences: selectedOptions }) // Save as text[]
            .eq('email', session.user.email); // Match by email

        if (error) {
            console.error("Failed to save preferences:", error.message);
            return;
        }

        setMenuView('main'); // Return to main menu
        alert("Dietary preferences saved successfully!");
    };

    return (
        <nav style={{
            backgroundColor: '#c00',
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

                {isLoggedIn && (
                    <>
                        <Button
                            onClick={handleClick}
                            startIcon={
                                <Avatar
                                    alt={session?.user?.name || "Profile"}
                                    src={session?.user?.image || ""}
                                    sx={{ width: 30, height: 30 }}
                                />
                            }
                            sx={{
                                color: 'white',
                                textTransform: 'none',
                                border: '1px solid white',
                                borderRadius: '20px',
                                padding: '0.3rem 0.8rem',
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            {session?.user?.name?.split(' ')[0] || 'Profile'}
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Box px={2} py={1} sx={{ maxWidth: '280px' }}>

                                {menuView === 'main' && (
                                    <>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {session?.user?.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {session?.user?.email}
                                        </Typography>

                                        <Divider sx={{ my: 1 }} />

                                        <MenuItem onClick={() => setMenuView('dietary')}>
                                            Dietary Preferences
                                        </MenuItem>
                                        <MenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                                            Sign Out
                                        </MenuItem>
                                    </>
                                )}

                                {menuView === 'dietary' && (
                                    <>
                                        <Box display="flex" alignItems="center">
                                            <IconButton onClick={() => setMenuView('main')} size="small">
                                                <ArrowBackIcon />
                                            </IconButton>
                                            <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                                Dietary Preferences
                                            </Typography>
                                        </Box>

                                        <FormGroup>
                                            {dietaryOptions.map((option) => (
                                                <FormControlLabel
                                                    key={option}
                                                    control={
                                                        <Checkbox
                                                            size="small"
                                                            checked={selectedOptions.includes(option)}
                                                            onChange={() => handleChange(option)}
                                                        />
                                                    }
                                                    label={option}
                                                />
                                            ))}
                                        </FormGroup>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            fullWidth
                                            sx={{ mt: 1 }}
                                            onClick={handleSavePreferences}
                                        >
                                            Save
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Menu>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;