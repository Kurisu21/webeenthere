const databaseSupportService = require('../services/DatabaseSupportService');

// Helper function to transform ticket from snake_case to camelCase
function transformTicket(ticket) {
  if (!ticket) return null;
  
  return {
    id: ticket.id?.toString() || ticket.id,
    ticketNumber: ticket.ticket_number || ticket.ticketNumber,
    userId: ticket.user_id?.toString() || ticket.userId,
    userName: ticket.user_name || ticket.userName || 'Unknown User',
    subject: ticket.subject,
    description: ticket.description,
    priority: ticket.priority,
    attachments: ticket.attachments || [],
    status: ticket.status,
    assignedTo: ticket.assigned_to?.toString() || ticket.assignedTo || null,
    assignedToName: ticket.assigned_to_name || ticket.assignedToName || null,
    createdAt: ticket.created_at || ticket.createdAt || null,
    updatedAt: ticket.updated_at || ticket.updatedAt || null,
    closedAt: ticket.closed_at || ticket.closedAt || null,
    resolution: ticket.resolution || null
  };
}

// Helper function to transform message from snake_case to camelCase
function transformMessage(message) {
  if (!message) return null;
  
  return {
    id: message.id?.toString() || message.id,
    ticketId: message.ticket_id?.toString() || message.ticketId,
    message: message.message,
    senderId: message.sender_id?.toString() || message.senderId,
    senderType: message.sender_type || message.senderType,
    senderName: message.sender_name || message.senderName || null,
    attachments: message.attachments || [],
    isInternal: message.is_internal || message.isInternal || false,
    createdAt: message.created_at || message.createdAt || null
  };
}

class SupportController {
  // Create ticket
  async createTicket(req, res) {
    try {
      const { subject, description, priority, attachments } = req.body;
      const userId = req.user?.id || 'user'; // Get from auth middleware
      const userRole = req.user?.role;

      // Prevent admins from creating tickets
      if (userRole === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot create support tickets. Please use the admin panel to manage tickets.'
        });
      }

      if (!subject || !description) {
        return res.status(400).json({
          success: false,
          message: 'Subject and description are required'
        });
      }

      const ticket = await databaseSupportService.createTicket({
        userId,
        subject,
        description,
        priority: priority || 'medium',
        attachments: attachments || []
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: transformTicket(ticket)
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ticket',
        error: error.message
      });
    }
  }

  // Update ticket
  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const ticket = await databaseSupportService.updateTicket(id, updateData);

      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: transformTicket(ticket)
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket',
        error: error.message
      });
    }
  }

  // Assign ticket
  async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
      }

      const ticket = await databaseSupportService.assignTicket(id, adminId);

      res.json({
        success: true,
        message: 'Ticket assigned successfully',
        data: transformTicket(ticket)
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign ticket',
        error: error.message
      });
    }
  }

  // Close ticket
  async closeTicket(req, res) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      const ticket = await databaseSupportService.closeTicket(id);

      res.json({
        success: true,
        message: 'Ticket closed successfully',
        data: transformTicket(ticket)
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close ticket',
        error: error.message
      });
    }
  }

  // Get tickets
  async getTickets(req, res) {
    try {
      const filters = req.query;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // For regular users, only show their own tickets
      if (userRole !== 'admin') {
        filters.userId = userId;
      }

      const tickets = await databaseSupportService.getAllTickets(filters);

      res.json({
        success: true,
        data: tickets.map(ticket => transformTicket(ticket))
      });
    } catch (error) {
      console.error('Error getting tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tickets',
        error: error.message
      });
    }
  }

  // Get single ticket
  async getTicket(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const ticket = await databaseSupportService.getTicketById(id);
      const transformedTicket = transformTicket(ticket);

      // For regular users, only allow access to their own tickets
      if (userRole !== 'admin' && transformedTicket.userId !== userId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own tickets.'
        });
      }

      res.json({
        success: true,
        data: transformedTicket
      });
    } catch (error) {
      console.error('Error getting ticket:', error);
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
        error: error.message
      });
    }
  }

  // Add message to ticket
  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message, attachments } = req.body;
      const senderId = req.user?.id || 'user'; // Get from auth middleware
      const senderType = req.user?.role === 'admin' ? 'admin' : 'user';

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Check if ticket exists and is not closed
      const ticket = await databaseSupportService.getTicketById(id);
      const transformedTicket = transformTicket(ticket);
      if (transformedTicket.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add messages to closed tickets'
        });
      }

      const messageObj = await databaseSupportService.createMessage({
        ticketId: id,
        message,
        senderId,
        senderType,
        attachments: attachments || []
      });

      res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: messageObj
      });
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error.message
      });
    }
  }

  // Get ticket messages
  async getTicketMessages(req, res) {
    try {
      const { id } = req.params;
      const { includeInternal } = req.query;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // First get the ticket to check ownership
      const ticket = await databaseSupportService.getTicketById(id);
      const transformedTicket = transformTicket(ticket);

      // For regular users, only allow access to their own tickets
      if (userRole !== 'admin' && transformedTicket.userId !== userId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view messages for your own tickets.'
        });
      }

      const messages = await databaseSupportService.getMessagesByTicket(id);

      res.json({
        success: true,
        data: messages.map(message => transformMessage(message))
      });
    } catch (error) {
      console.error('Error getting ticket messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ticket messages',
        error: error.message
      });
    }
  }

  // Get support statistics
  async getSupportStats(req, res) {
    try {
      const stats = await databaseSupportService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting support statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get support statistics',
        error: error.message
      });
    }
  }

  // Get recent tickets
  async getRecentTickets(req, res) {
    try {
      const { limit = 10 } = req.query;

      const tickets = await databaseSupportService.getAllTickets({ limit: parseInt(limit) });

      res.json({
        success: true,
        data: tickets.map(ticket => transformTicket(ticket))
      });
    } catch (error) {
      console.error('Error getting recent tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent tickets',
        error: error.message
      });
    }
  }

  // Delete ticket
  async deleteTicket(req, res) {
    try {
      const { id } = req.params;

      await databaseSupportService.deleteTicket(id);

      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ticket',
        error: error.message
      });
    }
  }

  // Bulk update tickets
  async bulkUpdateTickets(req, res) {
    try {
      const { ticketIds, updateData } = req.body;

      if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Ticket IDs array is required'
        });
      }

      const updatedTickets = [];
      for (const id of ticketIds) {
        const ticket = await databaseSupportService.updateTicket(id, updateData);
        updatedTickets.push(transformTicket(ticket));
      }

      res.json({
        success: true,
        message: 'Tickets updated successfully',
        data: updatedTickets
      });
    } catch (error) {
      console.error('Error bulk updating tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update tickets',
        error: error.message
      });
    }
  }

  // Get ticket assignments
  async getTicketAssignments(req, res) {
    try {
      const { id } = req.params;

      // Basic implementation - return empty array for now
      const assignments = [];

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error getting ticket assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ticket assignments',
        error: error.message
      });
    }
  }

  // Get admin workload
  async getAdminWorkload(req, res) {
    try {
      const { adminId } = req.params;

      // Basic implementation - return empty object for now
      const workload = { assignedTickets: 0, openTickets: 0, closedTickets: 0 };

      res.json({
        success: true,
        data: workload
      });
    } catch (error) {
      console.error('Error getting admin workload:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin workload',
        error: error.message
      });
    }
  }
}

module.exports = new SupportController();
