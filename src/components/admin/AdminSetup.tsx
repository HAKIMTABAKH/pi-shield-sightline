
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminUser } from '@/api/adminSetup';
import { useToast } from '@/hooks/use-toast';

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      const result = await createAdminUser();
      
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create admin user',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>
          Create the default admin user with credentials:
          <br />
          Email: admin@pishield.local
          <br />
          Password: test1234
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleCreateAdmin} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Admin...' : 'Create Admin User'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
