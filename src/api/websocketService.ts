
import { authService } from './authService';
import { Alert } from './alertService';
import { DashboardStats, AttackSource } from './dashboardService';

type WebSocketEventType = 
  | 'STATS_UPDATE' 
  | 'NEW_ALERT' 
  | 'ALERT_UPDATE' 
  | 'NEW_ATTACK_SOURCE';

interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private eventListeners: Map<WebSocketEventType, EventCallback[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000; // 5 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor() {
    this.eventListeners = new Map();
  }
  
  connect(url: string = 'ws://localhost:3001/ws'): void {
    // Don't reconnect if we're already connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    
    // In development mode, use mock websocket instead of real connection
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock WebSocket in development mode');
      this.setupMockWebSocket();
      return;
    }
    
    // Get auth token for authenticated connection
    const token = authService.getToken();
    const wsUrl = token ? `${url}?token=${token}` : url;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }
  
  on(eventType: WebSocketEventType, callback: EventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)?.push(callback);
  }
  
  off(eventType: WebSocketEventType, callback: EventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message;
    const callbacks = this.eventListeners.get(type);
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${type}:`, error);
        }
      });
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectTimeout * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  // For development mode only - simulates WebSocket events
  private setupMockWebSocket(): void {
    console.log('Setting up mock WebSocket events');
    
    // Simulate connection
    setTimeout(() => {
      console.log('Mock WebSocket connected');
      
      // Send mock data periodically
      this.mockInterval = setInterval(() => {
        // Random selector for mock event type
        const eventTypes: WebSocketEventType[] = [
          'STATS_UPDATE', 
          'NEW_ALERT', 
          'ALERT_UPDATE', 
          'NEW_ATTACK_SOURCE'
        ];
        
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        // Generate mock data based on event type
        let mockData: any;
        
        switch (randomType) {
          case 'STATS_UPDATE':
            mockData = {
              attacksBlocked: Math.floor(Math.random() * 50) + 10,
              activeAlerts: Math.floor(Math.random() * 10),
              riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
              deviceCount: Math.floor(Math.random() * 20) + 5
            };
            break;
            
          case 'NEW_ALERT':
            const severity: Alert['severity'] = 
              ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as Alert['severity'];
              
            mockData = {
              id: `alert-${Date.now()}`,
              timestamp: new Date().toISOString(),
              severity,
              type: ['SQL Injection', 'Port Scan', 'XSS Attack'][Math.floor(Math.random() * 3)],
              sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              destPort: Math.floor(Math.random() * 65000) + 1,
              status: 'new',
              details: `New mock alert detected by PiShield`
            };
            break;
            
          case 'ALERT_UPDATE':
            mockData = {
              id: `alert-${1000 + Math.floor(Math.random() * 20)}`,
              status: ['investigating', 'resolved'][Math.floor(Math.random() * 2)]
            };
            break;
            
          case 'NEW_ATTACK_SOURCE':
            const countries = ['Brazil', 'Russia', 'India', 'China', 'United States', 'Ukraine', 'Netherlands'];
            
            mockData = {
              id: `attack-${Date.now()}`,
              sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              country: countries[Math.floor(Math.random() * countries.length)],
              timestamp: new Date()
            };
            break;
        }
        
        const mockMessage: WebSocketMessage = {
          type: randomType,
          data: mockData
        };
        
        this.handleMessage(mockMessage);
      }, 10000); // Send mock data every 10 seconds
    }, 1000);
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export type { WebSocketEventType, WebSocketMessage };
