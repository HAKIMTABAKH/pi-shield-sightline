
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { execCommand } from '../utils/system.js';

const router = express.Router();

// Block an IP address
router.post('/block-ip', async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    
    // Validate IP format using regex
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ error: 'Invalid IP address format' });
    }
    
    // First store the blocked IP in the database
    const { data, error } = await supabaseAdmin
      .from('blocked_ips')
      .insert([
        { 
          ip_address: ip, 
          blocked_by_user_id: req.user.id,
          reason: 'Manually blocked via dashboard'
        }
      ])
      .select()
      .single();
    
    if (error) {
      logger.error(`Error storing blocked IP in database: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Then execute the iptables command to block the IP
    try {
      // In production, this would use something like execCommand from system utils
      // For development/demo, we'll simulate success
      if (process.env.NODE_ENV === 'production') {
        await execCommand(`sudo iptables -A INPUT -s ${ip} -j DROP`);
      } else {
        logger.info(`[SIMULATION] Blocked IP ${ip} using iptables`);
      }
      
      logger.info(`Successfully blocked IP ${ip}`);
      
      return res.status(200).json({ 
        success: true, 
        message: `IP ${ip} has been blocked successfully`, 
        blockedIp: data 
      });
    } catch (cmdError) {
      logger.error(`Error executing iptables command: ${cmdError.message}`);
      
      // Even if the command fails, we've recorded it in the database
      return res.status(500).json({ 
        error: 'Failed to block IP at firewall level',
        message: `IP ${ip} was recorded as blocked in the database, but the firewall command failed.`
      });
    }
  } catch (error) {
    logger.error(`Block IP error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error blocking IP' });
  }
});

// Unblock an IP address
router.post('/unblock-ip', async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    
    // First remove the IP from the database
    const { data, error } = await supabaseAdmin
      .from('blocked_ips')
      .delete()
      .eq('ip_address', ip)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error removing blocked IP from database: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Then execute the iptables command to unblock the IP
    try {
      // In production, this would use something like execCommand from system utils
      // For development/demo, we'll simulate success
      if (process.env.NODE_ENV === 'production') {
        await execCommand(`sudo iptables -D INPUT -s ${ip} -j DROP`);
      } else {
        logger.info(`[SIMULATION] Unblocked IP ${ip} using iptables`);
      }
      
      logger.info(`Successfully unblocked IP ${ip}`);
      
      return res.status(200).json({ 
        success: true, 
        message: `IP ${ip} has been unblocked successfully` 
      });
    } catch (cmdError) {
      logger.error(`Error executing iptables command: ${cmdError.message}`);
      
      // Even if the command fails, we've recorded it in the database
      return res.status(500).json({ 
        error: 'Failed to unblock IP at firewall level',
        message: `IP ${ip} was removed from blocked IPs in the database, but the firewall command failed.`
      });
    }
  } catch (error) {
    logger.error(`Unblock IP error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error unblocking IP' });
  }
});

// Get list of blocked IPs
router.get('/blocked-ips', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('blocked_ips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error(`Error getting blocked IPs: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ blockedIps: data });
  } catch (error) {
    logger.error(`Get blocked IPs error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error getting blocked IPs' });
  }
});

export default router;
