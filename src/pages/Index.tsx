
import { Navigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import AdminSetup from '@/components/admin/AdminSetup';

const Index = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  // If not authenticated, show admin setup or redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AdminSetup />
      </div>
    );
  }
  
  // If authenticated, go to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
