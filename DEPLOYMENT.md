# Webeenthere Deployment Guide for Render

## Overview
This project consists of two main services:
- **Backend**: Express.js server (Node.js)
- **Frontend**: Next.js application (React)

## Render Deployment Setup

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` file and deploy both services

### Option 2: Manual Setup

#### Backend Service
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Node Version**: 18.x or higher

#### Frontend Service
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `cd client && npm start`
   - **Node Version**: 18.x or higher

### Database Setup
1. Create a PostgreSQL database on Render
2. Note the connection details for environment variables

## Environment Variables

### Backend Service
Set these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
JWT_SECRET=<generate-a-secure-secret>
OPENAI_API_KEY=<your-openai-api-key>
```

### Frontend Service
Set these environment variables in Render dashboard:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

## Build Commands Summary

### Root Directory
```bash
# Install all dependencies
npm run install-all

# Build everything
npm run build

# Development
npm run dev
```

### Server Directory
```bash
# Install dependencies
npm install

# Start server
npm start

# Development
npm run dev
```

### Client Directory
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Development
npm run dev
```

## Package.json Scripts

### Root package.json
- `npm run install-all`: Installs dependencies for root, server, and client
- `npm run build`: Builds the entire project
- `npm run build-client`: Builds only the client
- `npm run dev`: Runs both server and client in development mode

### Server package.json
- `npm start`: Starts the production server
- `npm run dev`: Starts development server with nodemon

### Client package.json
- `npm run build`: Builds the Next.js application
- `npm start`: Starts the production Next.js server
- `npm run dev`: Starts development server

## Dependencies Verification

### Server Dependencies ✅
- express: Web framework
- mysql2: Database driver
- dotenv: Environment variables
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- express-validator: Input validation
- axios: HTTP client
- cors: Cross-origin resource sharing

### Client Dependencies ✅
- next: React framework
- react: UI library
- react-dom: React DOM
- grapesjs: Website builder
- Various GrapesJS plugins for enhanced functionality
- tailwindcss: CSS framework
- typescript: Type safety

## Production Considerations

1. **Database**: Make sure to set up a production database (PostgreSQL recommended for Render)
2. **Environment Variables**: All sensitive data should be stored as environment variables
3. **CORS**: Backend is configured to allow requests from frontend
4. **Static Files**: Next.js handles static file serving automatically
5. **Build Optimization**: Both services include proper build scripts for production

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version (requires 18+)
2. **Database Connection**: Verify environment variables are set correctly
3. **CORS Errors**: Ensure frontend URL is correctly configured in backend CORS settings
4. **Missing Dependencies**: Run `npm run install-all` to install all dependencies

### Logs
- Check Render dashboard logs for both services
- Backend logs will show API requests and errors
- Frontend logs will show build and runtime errors
