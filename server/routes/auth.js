
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      logger.warn(`Login failed for ${email}: ${error.message}`);
      return res.status(401).json({ error: error.message });
    }
    
    logger.info(`User ${email} logged in successfully`);
    
    // Return user and session data
    return res.status(200).json({
      user: data.user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Create user in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: { name }
    });
    
    if (error) {
      logger.warn(`Signup failed for ${email}: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
    
    logger.info(`New user created: ${email}`);
    
    // Return the created user
    return res.status(201).json({ user: data.user });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await supabaseAdmin.auth.admin.signOut(refreshToken);
    }
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error during logout' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(200).json({ user: data.user });
  } catch (error) {
    logger.error(`Get user profile error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error getting user profile' });
  }
});

export default router;
