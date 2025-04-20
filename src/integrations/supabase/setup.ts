
import { supabase } from './client';

// Function to set up Supabase authentication listeners
export const setupSupabaseAuth = (
  setUser: (user: any) => void,
  setSession: (session: any) => void
) => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Set up auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  // Return cleanup function
  return () => subscription.unsubscribe();
};

// Function to connect to WebSocket server
export const connectToWebSocket = (token: string) => {
  const wsUrl = 'ws://localhost:3001';
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    
    // Authenticate with the WebSocket server
    socket.send(JSON.stringify({
      type: 'AUTH',
      token
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      // Handle different message types
      // This can be expanded based on your application's needs
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return socket;
};

// Helper functions for common Supabase operations

// Get alerts with filtering
export const getAlerts = async (filters: any = {}) => {
  let query = supabase.from('alerts').select('*');
  
  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.search) {
    query = query.or(`sourceIp.ilike.%${filters.search}%,type.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

// Update alert status
export const updateAlertStatus = async (alertId: string, status: string) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status })
    .eq('id', alertId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

// Block an IP address
export const blockIp = async (ip: string) => {
  const { data, error } = await supabase
    .from('blocked_ips')
    .insert([{ ip_address: ip }])
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

// Get blocked IPs
export const getBlockedIps = async () => {
  const { data, error } = await supabase
    .from('blocked_ips')
    .select('*');
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
