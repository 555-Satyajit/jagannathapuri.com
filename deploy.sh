#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting Deployment..."

# Load NVM so that npm and pm2 are available in this non-interactive SSH session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 1. Pull latest code from GitHub
echo "Pulling latest code..."
git pull origin main

# 2. Setup Server
echo "Installing server dependencies..."
cd server
npm install
# Generate Prisma client (does not connect to DB, so it won't freeze)
npx prisma generate
cd ..

# 3. Setup Next.js Frontend
echo "Building next-frontend..."
cd next-frontend
npm install
npm run build
cd ..

# 4. Setup Admin Frontend
echo "Building admin-frontend..."
cd admin-frontend
npm install
npm run build
cd ..

# 5. Restart PM2 processes
echo "Restarting PM2 ecosystem..."
pm2 restart ecosystem.config.js --env production

echo "Deployment completed successfully!"
