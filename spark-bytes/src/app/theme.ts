import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c00' },
    secondary: { main: '#0070f3' },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#171717',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily:
      'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          color: '#171717',
          fontFamily:
            'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.6,
          margin: 0,
          padding: 0,
        },
        // Page Title (Header) styles
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#171717',
        },
        // Main content section styling
        '.mainContent': {
          padding: '20px',
          backgroundColor: '#f9f9f9',
        },
        // Footer styling
        '.footer': {
          backgroundColor: '#333',
          color: '#fff',
          padding: '10px 0',
          textAlign: 'center',
        },
        // Navbar styles
        '.navbar': {
          backgroundColor: '#0070f3',
          padding: '10px',
          textAlign: 'center',
        },
        '.foodItemBox': {
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '4px 8px',
            marginBottom: '6px',
            backgroundColor: '#fdfdfd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.2s ease',
            '&:hover': {
                backgroundColor: '#f0f0f0',
            },
        },
        '.foodItemsContainer': {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
        },
        'gmp-place-autocomplete-element': {
            fontFamily: 'SF Pro Text, -apple-system, sans-serif'
        },
        'gmp-place-autocomplete-element input': {
            border: 'none !important',
            fontFamily: 'inherit',
            fontSize: '1rem',
            width: '100%',
            background: 'transparent',
            outline: 'none'
        },
      },
    },
    // AddEvent Page Styles
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '1rem',
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            '& fieldset': {
              borderColor: '#ccc',
            },
            '&:hover fieldset': {
              borderColor: '#0070f3',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c00',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          textTransform: 'none',
          borderRadius: '8px',
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#c00',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#990000',
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: '#0070f3',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#005bb5',
            },
          },
        },
      },
    },
    
  },
});

export default theme;
