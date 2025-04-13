#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!" 