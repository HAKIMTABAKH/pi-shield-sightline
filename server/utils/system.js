
import { exec } from 'child_process';
import { logger } from './logger.js';

// Execute a system command
export function execCommand(command) {
  return new Promise((resolve, reject) => {
    logger.info(`Executing command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Command execution error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        logger.warn(`Command stderr: ${stderr}`);
      }
      
      logger.info(`Command stdout: ${stdout}`);
      resolve(stdout.trim());
    });
  });
}

// Get system information
export async function getSystemInfo() {
  try {
    // On a Raspberry Pi, you might want to get CPU temp, memory usage, etc.
    // For demo purposes, we'll return mock data
    
    if (process.env.NODE_ENV === 'production') {
      const cpuTemp = await execCommand("cat /sys/class/thermal/thermal_zone0/temp");
      const memInfo = await execCommand("free -m | grep 'Mem:'");
      const uptime = await execCommand("uptime -p");
      
      // Parse memory info
      const memParts = memInfo.split(/\s+/);
      const totalMem = parseInt(memParts[1]);
      const usedMem = parseInt(memParts[2]);
      
      return {
        cpuTemperature: parseInt(cpuTemp) / 1000, // Convert to degrees C
        memory: {
          total: totalMem,
          used: usedMem,
          percentUsed: Math.round((usedMem / totalMem) * 100)
        },
        uptime: uptime.replace('up ', '')
      };
    } else {
      // Return mock data for development
      return {
        cpuTemperature: 45.2,
        memory: {
          total: 8192,
          used: 3200,
          percentUsed: 39
        },
        uptime: '2 days, 4 hours, 12 minutes'
      };
    }
  } catch (error) {
    logger.error(`Error getting system info: ${error.message}`);
    throw error;
  }
}
