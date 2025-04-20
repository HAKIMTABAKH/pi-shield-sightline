
import { verifyToken } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export default async function authMiddleware(req, res, next) {
  try {
    // Get token from request headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
    
    try {
      // Verify token using Supabase
      const user = await verifyToken(token);
      
      // Attach user to request object for use in route handlers
      req.user = user;
      
      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ error: 'Authentication error' });
  }
}
