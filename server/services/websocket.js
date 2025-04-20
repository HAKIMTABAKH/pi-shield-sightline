import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger.js';
import { verifyToken } from '../config/supabase.js';

// Store connected clients
const clients = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws, req) => {
    let userId = null;
    let authenticated = false;
    
    logger.info(`WebSocket connection established`);
    
    // Handle authentication
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication message
        if (data.type === 'AUTH' && data.token) {
          try {
            const user = await verifyToken(data.token);
            userId = user.id;
            authenticated = true;
            clients.set(userId, ws);
            
            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              message: 'Authentication successful'
            }));
            
            logger.info(`WebSocket client authenticated: ${userId}`);
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'AUTH_ERROR',
              message: 'Authentication failed'
            }));
            
            logger.warn(`WebSocket authentication failed: ${error.message}`);
          }
        }
        
        // Handle other message types (if needed)
      } catch (error) {
        logger.error(`WebSocket message error: ${error.message}`);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        logger.info(`WebSocket client disconnected: ${userId}`);
      } else {
        logger.info('Unauthenticated WebSocket client disconnected');
      }
    });
    
    // Keep-alive pings
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 30000);
    
    ws.on('close', () => {
      clearInterval(pingInterval);
    });
  });
  
  return wss;
}

// Function to broadcast messages to all clients or specific users
export function broadcastMessage(message, userIds = null) {
  const messageString = typeof message === 'string' ? message : JSON.stringify(message);
  
  if (userIds) {
    // Send to specific users
    if (Array.isArray(userIds)) {
      userIds.forEach(userId => {
        const client = clients.get(userId);
        if (client && client.readyState === client.OPEN) {
          client.send(messageString);
        }
      });
    } else {
      // Single user ID
      const client = clients.get(userIds);
      if (client && client.readyState === client.OPEN) {
        client.send(messageString);
      }
    }
  } else {
    // Broadcast to all authenticated clients
    clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(messageString);
      }
    });
  }
}

// Helper functions for common broadcast scenarios
export function broadcastNewAlert(alert) {
  broadcastMessage({
    type: 'NEW_ALERT',
    data: alert
  });
}

export function broadcastStatsUpdate(stats) {
  broadcastMessage({
    type: 'STATS_UPDATE',
    data: stats
  });
}

export function broadcastAlertUpdate(alertId, status) {
  broadcastMessage({
    type: 'ALERT_UPDATE',
    data: { id: alertId, status }
  });
}

export function broadcastNewAttackSource(source) {
  broadcastMessage({
    type: 'NEW_ATTACK_SOURCE',
    data: source
  });
}
