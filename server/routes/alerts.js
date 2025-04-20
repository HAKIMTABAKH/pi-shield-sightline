
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { broadcastAlertUpdate } from '../services/websocket.js';

const router = express.Router();

// Get all alerts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      severity, 
      status, 
      search,
      sort = 'timestamp', 
      order = 'desc', 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the Supabase query with filters
    let query = supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);
    
    // Apply filters if provided
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`sourceIp.ilike.%${search}%,type.ilike.%${search}%`);
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      logger.error(`Error fetching alerts: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({
      alerts: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get alerts error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error fetching alerts' });
  }
});

// Get a single alert by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      logger.error(`Error fetching alert ${id}: ${error.message}`);
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    return res.status(200).json({ alert: data });
  } catch (error) {
    logger.error(`Get alert error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error fetching alert' });
  }
});

// Update alert status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['new', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error updating alert ${id}: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Broadcast the update via WebSocket
    broadcastAlertUpdate(id, status);
    
    return res.status(200).json({ alert: data });
  } catch (error) {
    logger.error(`Update alert status error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error updating alert status' });
  }
});

// Create a new alert (used by detection scripts)
router.post('/', async (req, res) => {
  try {
    const alertData = req.body;
    
    // Validate required fields
    const requiredFields = ['severity', 'type', 'sourceIp'];
    const missingFields = requiredFields.filter(field => !alertData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Set defaults if not provided
    const newAlert = {
      ...alertData,
      timestamp: alertData.timestamp || new Date().toISOString(),
      status: alertData.status || 'new'
    };
    
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .insert([newAlert])
      .select()
      .single();
    
    if (error) {
      logger.error(`Error creating alert: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Broadcast the new alert via WebSocket would happen here
    // This is handled in the WebSocket service
    
    logger.info(`New alert created: ${data.id}`);
    return res.status(201).json({ alert: data });
  } catch (error) {
    logger.error(`Create alert error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error creating alert' });
  }
});

export default router;
