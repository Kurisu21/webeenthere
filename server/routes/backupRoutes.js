const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');
const BackupController = require('../controllers/BackupController');

// Initialize controller
const backupController = new BackupController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

// Backup management routes
router.post('/create', (req, res) => backupController.createBackup(req, res));
router.get('/list', (req, res) => backupController.listBackups(req, res));
router.get('/:id/download', (req, res) => backupController.downloadBackup(req, res));
router.post('/:id/restore', (req, res) => backupController.restoreBackup(req, res));
router.delete('/:id', (req, res) => backupController.deleteBackup(req, res));
router.get('/stats', (req, res) => backupController.getBackupStats(req, res));
router.get('/schedule', (req, res) => backupController.getBackupSchedule(req, res));
router.put('/schedule', (req, res) => backupController.updateBackupSchedule(req, res));
router.get('/:id/validate', (req, res) => backupController.validateBackup(req, res));

module.exports = router;
