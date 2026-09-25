import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AudioPlayerProvider>
            <AppRoutes />
          </AudioPlayerProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
