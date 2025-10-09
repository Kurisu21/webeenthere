#!/usr/bin/env node

const { createBackup, listBackups, restoreBackup } = require('./backupService');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('💾 Webeenthere Database Backup Manager');
  console.log('=====================================\n');

  switch (command) {
    case 'create':
    case 'backup':
      console.log('Creating database backup...');
      const result = await createBackup();
      if (result.success) {
        console.log(`✅ Backup created: ${result.fileName}`);
        console.log(`📁 Location: ${result.dateFolder}/${result.fileName}`);
        console.log(`📊 Size: ${(result.size / 1024).toFixed(2)} KB`);
      } else {
        console.log(`❌ Backup failed: ${result.error}`);
        process.exit(1);
      }
      break;

    case 'list':
      console.log('📋 Available backups:');
      const backups = listBackups();
      if (backups.length === 0) {
        console.log('No backups found.');
      } else {
        backups.forEach((backup, index) => {
          console.log(`\n${index + 1}. ${backup.fileName}`);
          console.log(`   📁 Folder: ${backup.dateFolder}`);
          console.log(`   📅 Created: ${backup.created.toLocaleString()}`);
          console.log(`   📊 Size: ${(backup.size / 1024).toFixed(2)} KB`);
        });
      }
      break;

    case 'restore':
      const fileName = args[1];
      const dateFolder = args[2]; // Optional date folder
      
      if (!fileName) {
        console.log('❌ Please specify a backup file name to restore.');
        console.log('Usage: node backupManager.js restore <filename> [date-folder]');
        console.log('Example: node backupManager.js restore webeenthere_backup_2024-01-15_10-30-00.sql 2024-01-15');
        process.exit(1);
      }
      
      console.log(`Restoring backup: ${fileName}${dateFolder ? ` from ${dateFolder}` : ''}`);
      const restoreResult = await restoreBackup(fileName, dateFolder);
      if (restoreResult.success) {
        console.log(`✅ Backup restored successfully: ${fileName}`);
      } else {
        console.log(`❌ Restore failed: ${restoreResult.error}`);
        process.exit(1);
      }
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log('Usage: node backupManager.js <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  create, backup    Create a new database backup');
      console.log('  list              List all available backups');
      console.log('  restore <file> [date-folder]    Restore from a backup file');
      console.log('  help              Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  node backupManager.js create');
      console.log('  node backupManager.js list');
      console.log('  node backupManager.js restore webeenthere_backup_2024-01-15_10-30-00.sql');
      console.log('  node backupManager.js restore webeenthere_backup_2024-01-15_10-30-00.sql 2024-01-15');
      break;

    default:
      console.log('❌ Unknown command. Use "help" to see available commands.');
      console.log('');
      console.log('Quick commands:');
      console.log('  node backupManager.js create    - Create backup');
      console.log('  node backupManager.js list      - List backups');
      console.log('  node backupManager.js help      - Show help');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
