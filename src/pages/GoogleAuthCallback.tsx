import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { googleAuthService } from '@/services/googleAuthService';
import { toast } from '@/components/ui/use-toast';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the code from the URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          throw new Error(`Google authentication error: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received from Google');
        }
        
        // Use our service to handle the callback
        await googleAuthService.handleCallback(code);
        
        // Show success message
        toast({
          title: "Google Calendar Connected",
          description: "Your Google Calendar has been successfully connected.",
        });
        
        // Redirect to settings page
        navigate('/settings?success=google_connected');
      } catch (err: any) {
        console.error('Error in Google auth callback:', err);
        setError(err.message || 'Google Calendar connection failed');
        
        // After displaying error for a few seconds, redirect to settings
        setTimeout(() => {
          navigate('/settings?error=google_connection_failed');
        }, 5000);
      }
    };
    
    handleCallback();
  }, [location.search, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error connecting to Google Calendar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col items-center">
          <Spinner className="h-12 w-12 mb-4" />
          <p className="text-lg">Connecting to Google Calendar...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthCallback; 