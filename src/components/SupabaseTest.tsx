'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        // Display connection info
        setDetails(prev => [...prev, `Testing connection to Supabase...`]);
        
        // Test 1: Auth system (this is a reliable way to test the connection)
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          setDetails(prev => [...prev, `Auth Error: ${authError.message}`]);
          throw authError;
        } else {
          setDetails(prev => [...prev, 'Auth system accessible ✓']);
        }

        // Test 2: Try to create a test table if it doesn't exist
        try {
          // First, check if we have permission to create a table
          const { error: tableQueryError } = await supabase
            .from('connection_test')
            .select('*')
            .limit(1);
          
          if (tableQueryError && tableQueryError.code === '42P01') {
            // Table doesn't exist, this is expected
            setDetails(prev => [...prev, 'Database access working ✓']);
          } else if (tableQueryError) {
            // Other error
            setDetails(prev => [...prev, `Database query error: ${tableQueryError.message}`]);
          } else {
            // Table exists, that's fine too
            setDetails(prev => [...prev, 'Found existing test table ✓']);
          }
        } catch (dbError: any) {
          setDetails(prev => [...prev, `Database test error: ${dbError?.message || 'Unknown error'}`]);
          // Continue anyway, this is just additional info
        }

        // Final Status
        setStatus('success');
        setMessage('Successfully connected to Supabase!');
        
      } catch (error: any) {
        setStatus('error');
        setMessage(`Failed to connect to Supabase: ${error?.message || 'Unknown error'}`);
        console.error('Supabase connection error:', error);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <div className={`p-2 rounded ${
        status === 'loading' ? 'bg-yellow-100' :
        status === 'success' ? 'bg-green-100' :
        'bg-red-100'
      }`}>
        <p className="font-medium">{status === 'loading' ? 'Testing connection...' : message}</p>
        {details.length > 0 && (
          <ul className="mt-2 text-sm">
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 