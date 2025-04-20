
# PiShield Backend Server

This is the backend server for the PiShield Intrusion Detection System, designed to run on a Raspberry Pi and interface with a Supabase database for data storage and authentication.

## Features

- **Authentication** - Uses Supabase Auth with JWT verification
- **Real-time Updates** - WebSocket server for instant alerts
- **Database Integration** - Stores alerts, blocked IPs, and settings in Supabase
- **IP Blocking** - Ability to block malicious IPs using iptables
- **Detection Simulation** - Generates mock security alerts for testing/demo purposes
- **API Endpoints** - RESTful API for the frontend to interact with

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- NPM or Yarn
- A Supabase project (free tier works fine for testing)
- Raspberry Pi (for production deployment)

### Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd pishield-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the example environment file and configure it:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```

5. Set up Supabase tables:
   - Execute the SQL commands in `supabase-setup.sql` in your Supabase SQL Editor

### Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user profile

### Alerts
- `GET /api/alerts` - Get all alerts with filtering and pagination
- `GET /api/alerts/:id` - Get a single alert by ID
- `PUT /api/alerts/:id/status` - Update alert status
- `POST /api/alerts` - Create a new alert

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart-data` - Get attack chart data
- `GET /api/dashboard/attack-sources` - Get recent attack sources

### Actions
- `POST /api/actions/block-ip` - Block an IP address
- `POST /api/actions/unblock-ip` - Unblock an IP address
- `GET /api/actions/blocked-ips` - Get list of blocked IPs

### Devices
- `GET /api/devices` - Get all monitored devices

## WebSocket

The server also exposes a WebSocket endpoint for real-time updates. Clients can connect to `ws://server-address/ws` and will receive updates for:

- New alerts
- Alert status changes
- Dashboard stats updates
- New attack sources

### WebSocket Authentication

Send an authentication message after connecting:

```json
{
  "type": "AUTH",
  "token": "your-jwt-token"
}
```

## Simulation Mode

In development, the server runs in simulation mode, generating random alerts periodically. This can be disabled by setting `NODE_ENV=production` in your `.env` file.

## Production Deployment on Raspberry Pi

For production deployment on a Raspberry Pi:

1. Install Node.js 18.x:
   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Clone and set up the repository as described above.

3. Consider using PM2 for process management:
   ```
   npm install -g pm2
   pm2 start index.js --name pishield
   pm2 startup
   pm2 save
   ```

4. Make sure the Pi has the necessary permissions to run iptables commands:
   ```
   sudo visudo
   ```
   
   Add this line (replace `pi` with your username if different):
   ```
   pi ALL=NOPASSWD: /sbin/iptables
   ```

5. Set up a reverse proxy with Nginx if needed.

## Security Considerations

- The `SUPABASE_SERVICE_ROLE_KEY` has full access to your database. Keep it secure and never expose it to the frontend.
- Use HTTPS in production to secure communication between the frontend and backend.
- Consider implementing rate limiting to prevent abuse.
- Regularly update dependencies to patch security vulnerabilities.
