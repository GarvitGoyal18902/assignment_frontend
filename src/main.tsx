import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';


import App from './App';
import './style.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!clientId) {
    console.error('Missing Google Client ID');
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
            <StrictMode>
                <App />
            </StrictMode>
        </GoogleOAuthProvider>
    </BrowserRouter>
);
