const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuthMiddleware } = require('../middleware/auth');
const BackupController = require('../controllers/BackupController');

// Initialize controller
const backupController = new BackupController();

// Apply admin authentication middleware to all routes
router.use(adminAuthMiddleware);

// Configure multer for file uploads (for import)
const uploadDir = path.join(__dirname, '..', '..', 'temp', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'database-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept .sql files
    if (path.extname(file.originalname).toLowerCase() === '.sql') {
      cb(null, true);
    } else {
      cb(new Error('Only .sql files are allowed'));
    }
  }
});

// Database export/import routes (must come before parameterized routes)
router.get('/export', (req, res) => backupController.exportDatabase(req, res));
router.post('/import', upload.single('file'), (req, res) => backupController.importDatabase(req, res));

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
