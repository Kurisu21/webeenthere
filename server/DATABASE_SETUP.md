# Database Setup Guide

This guide explains how to set up the MySQL database for the Webeenthere application.

## Prerequisites

- XAMPP installed and running
- MySQL service started in XAMPP
- Node.js and npm installed

## Quick Setup

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start MySQL service

2. **Initialize Database**
   ```bash
   cd server
   npm run init-db
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

## Manual Setup

If you prefer to set up the database manually:

1. **Create Database**
   ```sql
   CREATE DATABASE webeenthere;
   ```

2. **Run Initialization Script**
   ```bash
   npm run init-db
   ```

## Database Schema

The database includes the following tables:

- **users** - User accounts and authentication
- **templates** - Website templates
- **websites** - User-created websites
- **ai_prompts** - AI-generated content
- **media_assets** - Uploaded files
- **website_analytics** - Visit tracking
- **custom_blocks** - Reusable content blocks
- **plans** - Subscription plans
- **user_plan** - User subscription data

## Dummy Data

The initialization script creates sample data:

### Users (5)
- `john_doe` / `password123` (user)
- `jane_smith` / `password123` (user)
- `admin_user` / `password123` (admin)
- `artist_creative` / `password123` (user)
- `business_owner` / `password123` (user)

### Templates (5)
- Modern Portfolio
- Business Landing
- Creative Artist
- Minimal Blog
- Restaurant Menu

### Websites (5)
- John's Portfolio
- Jane's Art Gallery
- Admin Dashboard
- Creative Studio
- Business Solutions

### Plans (3)
- Free ($0.00)
- Pro ($9.99)
- Business ($19.99)

## Commands

```bash
# Initialize database with tables and dummy data
npm run init-db

# Check database status
npm run db-status

# Start development server (auto-initializes database and creates backup)
npm run dev

# Start production server
npm start

# Backup management
npm run backup          # Create manual backup
npm run list-backups    # List all backups
npm run restore-backup  # Restore from backup
```

## Auto-Initialization

The server now automatically:
- ✅ Checks if database exists on startup
- ✅ Creates database and tables if missing
- ✅ Seeds dummy data only if tables are empty
- ✅ Creates initial backup on startup
- ✅ Schedules automatic backups every 6 hours

## Environment Variables

Create a `.env` file in the server directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=webeenthere
DB_PORT=3306
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Database Connection Failed
- Ensure MySQL is running in XAMPP
- Check your `.env` file configuration
- Verify database credentials

### Tables Already Exist
- The ORM will skip table creation if they already exist
- Dummy data will only be added if tables are empty

### Permission Issues
- Make sure the MySQL user has CREATE and INSERT permissions
- For XAMPP, the default `root` user should have full permissions

## Database ORM Features

The `DatabaseORM` class provides:

- **Automatic database creation** - Creates `webeenthere` database if missing
- **Table management** - Creates all required tables with proper relationships
- **Data seeding** - Adds dummy data only if tables are empty
- **Status checking** - Reports database and table status
- **Error handling** - Graceful error handling and logging

## Backup System

The application includes an automatic backup system:

### Features
- **Automatic backups**: Created on server startup and every 6 hours
- **Date-based organization**: Backups organized in folders by date (YYYY-MM-DD)
- **Timestamped files**: Backups saved with date/time in filename
- **No auto-cleanup**: All backups are kept indefinitely
- **Manual management**: Create, list, and restore backups via CLI

### Backup Location
Backups are stored in: `server/backups/YYYY-MM-DD/`

### Backup File Format
```
server/backups/2024-01-15/webeenthere_backup_2024-01-15_10-30-00.sql
```

### Manual Backup Commands
```bash
# From root directory
npm run backup          # Create backup
npm run list-backups    # List all backups

# From server directory
npm run backup          # Create backup
npm run list-backups    # List all backups
npm run restore-backup  # Restore from backup
```

## File Structure

```
server/
├── database/           # Database-related files
│   ├── databaseORM.js  # Main ORM class
│   ├── initDatabase.js # Initialization script
│   └── database.js     # Database connection
├── server.js          # Server startup
├── backupService.js    # Backup service
├── backupManager.js    # Backup CLI manager
├── backups/           # Backup files directory
│   └── YYYY-MM-DD/    # Date-based backup folders
└── DATABASE_SETUP.md  # This file
```


