
import { Navigate } from 'react-router-dom';
import { authService } from '@/api/authService';

const Index = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  // If authenticated, go to dashboard; otherwise, go to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default Index;
