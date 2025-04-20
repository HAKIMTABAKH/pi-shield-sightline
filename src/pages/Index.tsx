
import { Navigate } from 'react-router-dom';
import { authService } from '@/api/authService';

const Index = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  // If authenticated, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not authenticated, go to login
  return <Navigate to="/login" replace />;
};

export default Index;
