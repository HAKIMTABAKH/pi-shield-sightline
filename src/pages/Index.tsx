
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import AdminSetup from '@/components/admin/AdminSetup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin exists and authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // First check if user is already authenticated
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      // Then check if admin exists by checking profiles
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('role', 'admin')
          .maybeSingle();
          
        if (data) {
          setAdminExists(true);
        } else {
          setAdminExists(false);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
        setAdminExists(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we check your authentication status.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not authenticated but admin exists, redirect to login
  if (adminExists) {
    return <Navigate to="/login" replace />;
  }
  
  // If no admin exists, show admin setup
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AdminSetup onSetupComplete={() => setAdminExists(true)} />
    </div>
  );
};

export default Index;
