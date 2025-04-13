'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function TestDoctorLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const email = 'doctornew@clinic.com';
  const password = 'password123';

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log(`Attempting login with email: ${email} and password: ${password}`);
      
      // Try to get the current session first to see if we're already logged in
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      if (sessionData.session) {
        console.log('Already logged in, signing out first...');
        await supabase.auth.signOut();
      }
      
      // Now attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        console.error('Login error:', error);
        
        // Add debug info
        setDebugInfo({
          errorCode: error.code,
          errorName: error.name,
          errorStatus: error.status
        });
      } else {
        setSuccess(true);
        console.log('Login successful:', data);
        // Redirect after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Login exception:', err);
      setDebugInfo(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Doctor Login Test</h1>
          <p className="mt-2 text-gray-600">
            Logging in with: <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">Password: {password}</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            <p className="font-bold">Error: {error}</p>
            {debugInfo && (
              <div className="mt-2 text-xs">
                <p>Debug Information:</p>
                <pre className="mt-1 overflow-auto bg-gray-100 p-2">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-green-700">
            <p>Login successful! Redirecting to dashboard...</p>
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Logging in...' : 'Log in as Doctor'}
        </Button>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>If login fails, check browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
} 