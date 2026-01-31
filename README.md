# Pulse360 - Node.js Server

This is now a Node.js/Express-based application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (optional):
   ```
   PORT=3000
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   - **Citizen Module**: `http://localhost:3000/citizen`
   - **PDRRMO Module**: `http://localhost:3000/pdrrmo`
   - **Root**: `http://localhost:3000` (redirects to citizen)

## Project Structure

```
pulse360/
├── server.js              # Main Express server
├── package.json           # Node.js dependencies and scripts
├── .env                   # Environment variables (create this)
├── citizen/              # Citizen module (static files)
│   ├── login.html
│   ├── css/
│   ├── page/
│   ├── images/
│   └── script/
└── pdrrmo/               # PDRRMO module (static files)
    ├── login.html
    ├── css/
    ├── page/
    ├── images/
    └── script/
```

## Notes

- The server runs on port 3000 by default (configurable via `.env`)
- CORS is enabled for cross-origin requests
- All static files from both modules are served
- Firebase configuration is preserved in the client-side scripts
