const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/SupportController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// Authenticated routes (require login)
router.post('/tickets', authMiddleware, SupportController.createTicket);
router.get('/tickets/my', authMiddleware, SupportController.getTickets);
router.get('/tickets/:id', authMiddleware, SupportController.getTicket);
router.put('/tickets/:id', authMiddleware, SupportController.updateTicket);
router.delete('/tickets/:id', authMiddleware, SupportController.deleteTicket);

router.post('/tickets/:id/messages', authMiddleware, SupportController.addMessage);
router.get('/tickets/:id/messages', authMiddleware, SupportController.getTicketMessages);

// Admin routes (require authentication and admin role)
router.get('/tickets', authMiddleware, adminAuthMiddleware, SupportController.getTickets);
router.post('/tickets/:id/assign', authMiddleware, adminAuthMiddleware, SupportController.assignTicket);
router.post('/tickets/:id/close', authMiddleware, adminAuthMiddleware, SupportController.closeTicket);
router.get('/tickets/:id/assignments', authMiddleware, adminAuthMiddleware, SupportController.getTicketAssignments);

router.get('/stats', authMiddleware, adminAuthMiddleware, SupportController.getSupportStats);
router.get('/recent', authMiddleware, adminAuthMiddleware, SupportController.getRecentTickets);
router.post('/bulk/update', authMiddleware, adminAuthMiddleware, SupportController.bulkUpdateTickets);
router.get('/admin/:adminId/workload', authMiddleware, adminAuthMiddleware, SupportController.getAdminWorkload);

module.exports = router;
