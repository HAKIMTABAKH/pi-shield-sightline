
import { API_ENDPOINTS, getRequestOptions } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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
      // For demo purposes, simulate a successful login without actual API call
      if (process.env.NODE_ENV === 'development') {
        console.log('Demo login with:', credentials);
        
        // Mock response for development
        const mockResponse: LoginResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
          }
        };
        
        // Store auth data
        localStorage.setItem(TOKEN_KEY, mockResponse.token);
        localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
        
        return mockResponse;
      }
      
      // Real API call for production
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        ...getRequestOptions(),
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data: LoginResponse = await response.json();
      
      // Store auth data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout(): void {
    // Remove auth data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // In a real app, you might want to call the logout endpoint as well
    // fetch(API_ENDPOINTS.auth.logout, { method: 'POST', ...getRequestOptions(this.getToken()) });
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
  }
};
