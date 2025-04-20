
import { API_ENDPOINTS, getRequestOptions } from './config';
import { supabase } from '@/integrations/supabase/client';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  }
}

// For demo purposes, we'll use localStorage, but in production consider more secure options
const TOKEN_KEY = 'pishield_auth_token';
const USER_KEY = 'pishield_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (authError) {
        console.error('Supabase login error:', authError);
        
        // For demo purposes - allow login with the admin credentials even if not confirmed
        if (credentials.email === 'admin@pishield.local' && credentials.password === 'test1234') {
          console.log('Using demo admin credentials bypass');
          
          // Create a mock response
          const mockToken = 'demo-admin-token';
          const mockUser = {
            id: 'demo-admin-id',
            email: 'admin@pishield.local',
            name: 'Admin User',
          };
          
          localStorage.setItem(TOKEN_KEY, mockToken);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
          
          return {
            token: mockToken,
            user: mockUser
          };
        }
        
        throw new Error(authError.message);
      }
      
      // Store auth data
      const token = authData.session.access_token;
      localStorage.setItem(TOKEN_KEY, token);
      
      const user = {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.name || 'User',
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return {
        token,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async signup(credentials: SignupCredentials): Promise<void> {
    try {
      // Register with Supabase
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || ''
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Remove auth data from localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  getUser(): LoginResponse['user'] | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  
  // Listen for auth state changes
  onAuthStateChange(callback: (user: LoginResponse['user'] | null) => void) {
    // Set up listener for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
          };
          
          localStorage.setItem(TOKEN_KEY, session.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          
          callback(user);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          
          callback(null);
        }
      }
    );
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
};
