
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all devices (in a real system, this would query a devices table)
router.get('/', async (req, res) => {
  try {
    // In this demo version, we're returning mock data
    // In a real implementation, this would query the Supabase database
    
    const mockDevices = [
      {
        id: '1',
        name: 'Router',
        ip: '192.168.1.1',
        mac: '00:1A:2B:3C:4D:5E',
        type: 'network',
        lastSeen: new Date().toISOString(),
        status: 'online'
      },
      {
        id: '2',
        name: 'Smart TV',
        ip: '192.168.1.101',
        mac: 'AA:BB:CC:DD:EE:FF',
        type: 'iot',
        lastSeen: new Date().toISOString(),
        status: 'online'
      },
      {
        id: '3',
        name: 'Laptop',
        ip: '192.168.1.102',
        mac: '11:22:33:44:55:66',
        type: 'computer',
        lastSeen: new Date().toISOString(),
        status: 'online'
      },
      {
        id: '4',
        name: 'Smartphone',
        ip: '192.168.1.103',
        mac: 'AA:BB:CC:11:22:33',
        type: 'mobile',
        lastSeen: new Date().toISOString(),
        status: 'online'
      },
      {
        id: '5',
        name: 'Smart Speaker',
        ip: '192.168.1.104',
        mac: 'FF:EE:DD:CC:BB:AA',
        type: 'iot',
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'offline'
      }
    ];
    
    return res.status(200).json({ devices: mockDevices });
  } catch (error) {
    logger.error(`Get devices error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error fetching devices' });
  }
});

export default router;
