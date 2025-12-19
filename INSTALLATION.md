# Installation Guide

**Note: This installation guide is for local development setup, not for deployment. This guide is intended for capstone manuscript documentation.**

## Step 1: Prerequisites

1. Install Node.js version 18 or higher on your system.
2. Install MySQL database server (XAMPP or standalone MySQL).
3. Install Git version control system.
4. Verify all installations are complete before proceeding.

## Step 2: Clone Repository

1. Open terminal or command prompt.
2. Navigate to desired directory for project installation.
3. Run command: `git clone https://github.com/Kurisu21/webeenthere.git`
4. Navigate to project directory: `cd webeenthere`
5. Verify project files are present in directory.

## Step 3: Database Setup

1. Start MySQL server using XAMPP Control Panel or standalone MySQL service.
2. Open phpMyAdmin or MySQL command line interface.
3. Create new database named: `webeenthere`
4. Navigate to server directory in terminal: `cd server`
5. Initialize database by running: `npm run init-db`
6. Wait for database tables to be created successfully.
7. Verify database initialization completed without errors.
8. Check default login credentials if needed (Username: `john_doe`, Password: `password123` or Username: `admin_user`, Password: `password123`).

## Step 4: Environment Variables Setup

1. Navigate to server directory: `cd server`
2. Create a new file named `.env` in the server directory.
3. Add the following environment variables to the `.env` file:

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=webeenthere
DB_PORT=3306
JWT_SECRET=your-secret-key-here-generate-a-random-string
```

4. Generate a secure JWT secret key (you can use an online generator or run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
5. Replace `your-secret-key-here-generate-a-random-string` with your generated secret.
6. If your MySQL password is not empty, update `DB_PASSWORD` with your MySQL root password.
7. Save the `.env` file.

## Step 5: API Keys Setup (Optional)

1. Visit OpenAI website: https://platform.openai.com/api-keys (optional, requires payment).
2. Create OpenAI account if needed.
3. Generate API key from OpenAI dashboard.
4. Copy API key and add to `.env` file as `OPENAI_API_KEY=your-api-key-here`.
5. Visit OpenRouter website: https://openrouter.ai/keys (alternative AI service).
6. Create OpenRouter account if needed.
7. Generate API key from OpenRouter dashboard.
8. Copy API key and add to `.env` file as `OPENROUTER_API_KEY=your-api-key-here`.
9. Save `.env` file after adding all API keys.

**Note:** AI features will not work without at least one API key configured. The application will still run but AI generation features will be unavailable.

## Step 6: Backend Setup

1. Open terminal or command prompt in project root directory.
2. Navigate to server directory: `cd server`
3. Install Node.js dependencies: `npm install`
4. Wait for all packages to install successfully.
5. Verify `node_modules` folder is created in server directory.
6. Check for any installation errors in terminal output.
7. Backend server will run on `http://localhost:5000`

## Step 7: Frontend Setup

1. Open terminal or command prompt in project root directory.
2. Navigate to client directory: `cd client`
3. Install Node.js dependencies: `npm install`
4. Wait for all packages to install successfully.
5. Verify `node_modules` folder is created in client directory.
6. Check for any installation errors in terminal output.
7. Frontend development server will run on `http://localhost:3000`

## Step 8: Start Backend Server

1. Ensure MySQL server is running (XAMPP or standalone MySQL).
2. Open terminal or command prompt.
3. Navigate to server directory: `cd server`
4. Run command: `npm start` or `npm run dev` (for development with auto-reload)
5. Wait for server to start successfully.
6. Verify backend is running on `http://localhost:5000`
7. Check terminal for any error messages.
8. Keep terminal window open while backend is running.

## Step 9: Start Frontend Server

1. Open new terminal or command prompt window.
2. Navigate to client directory: `cd client`
3. Run command: `npm run dev`
4. Wait for development server to start.
5. Verify frontend is running on `http://localhost:3000`
6. Check terminal for any error messages.
7. Keep terminal window open while frontend is running.

## Step 10: Verify Installation

1. Open web browser.
2. Navigate to `http://localhost:3000`
3. Verify homepage loads successfully.
4. Click Register button to test registration functionality.
5. Fill in registration form with test data.
6. Submit registration form.
7. Check email for verification code if email service is configured.
8. Complete email verification process.
9. Login with registered account credentials or use default credentials (Username: `john_doe`, Password: `password123`).
10. Verify dashboard loads after successful login.
11. Test basic functionality of application including website builder.
12. Create a test website to verify full application workflow.

## Troubleshooting

### Database Connection Issues

1. Verify MySQL server is running.
2. Check database credentials in `.env` file match your MySQL configuration.
3. Ensure database `webeenthere` exists.
4. Run `npm run db-status` in server directory to check database status.

### Port Already in Use

1. If port 5000 is in use, change `PORT` in server `.env` file.
2. If port 3000 is in use, Next.js will automatically use the next available port.
3. Check terminal output for the actual port being used.

### Installation Errors

1. Ensure Node.js version is 18 or higher: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` folders and `package-lock.json` files.
4. Run `npm install` again in both server and client directories.

### AI Features Not Working

1. Verify API keys are correctly set in `.env` file.
2. Check API key has sufficient credits or quota.
3. Review server terminal logs for API-related errors.
4. AI features are optional and application works without them.
