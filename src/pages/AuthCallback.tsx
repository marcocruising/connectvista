import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore } from '@/store/crmStore';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { initializeAuth } = useCRMStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Initialize auth state
        await initializeAuth();
        
        // Handle the OAuth callback
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, initializeAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Signing you in...</h2>
        <p className="text-gray-500">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 