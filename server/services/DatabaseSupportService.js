const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseSupportService {
  // Generate unique ticket number
  generateTicketNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TICKET-${timestamp}-${random}`.toUpperCase();
  }

  // Tickets
  async getAllTickets(filters = {}) {
    const connection = await getDatabaseConnection();
    let query = `SELECT t.*, u.username as user_name, a.username as assigned_to_name 
                 FROM support_tickets t 
                 LEFT JOIN users u ON t.user_id = u.id 
                 LEFT JOIN users a ON t.assigned_to = a.id 
                 WHERE 1=1`;
    const params = [];
    
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    if (filters.userId) {
      query += ' AND t.user_id = ?';
      params.push(filters.userId);
    }
    if (filters.assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(filters.assignedTo);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const [rows] = await connection.execute(query, params);
    return rows;
  }

  async getTicketById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as user_name, a.username as assigned_to_name 
       FROM support_tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       LEFT JOIN users a ON t.assigned_to = a.id 
       WHERE t.id = ?`,
      [id]
    );
    if (rows.length === 0) throw new Error('Ticket not found');
    return rows[0];
  }

  async getTicketByNumber(ticketNumber) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as user_name, a.username as assigned_to_name 
       FROM support_tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       LEFT JOIN users a ON t.assigned_to = a.id 
       WHERE t.ticket_number = ?`,
      [ticketNumber]
    );
    if (rows.length === 0) throw new Error('Ticket not found');
    return rows[0];
  }

  async createTicket(data) {
    const connection = await getDatabaseConnection();
    const ticketNumber = this.generateTicketNumber();
    
    const [result] = await connection.execute(
      'INSERT INTO support_tickets (ticket_number, user_id, subject, description, priority) VALUES (?, ?, ?, ?, ?)',
      [ticketNumber, data.userId, data.subject, data.description, data.priority || 'medium']
    );
    
    return this.getTicketById(result.insertId);
  }

  async updateTicket(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.status) { updates.push('status = ?'); params.push(data.status); }
    if (data.priority) { updates.push('priority = ?'); params.push(data.priority); }
    if (data.assignedTo !== undefined) { updates.push('assigned_to = ?'); params.push(data.assignedTo); }
    if (data.resolution !== undefined) { updates.push('resolution = ?'); params.push(data.resolution); }
    
    if (data.status === 'closed') {
      updates.push('closed_at = NOW()');
    }
    
    if (updates.length === 0) return this.getTicketById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getTicketById(id);
  }

  async assignTicket(id, adminId) {
    const connection = await getDatabaseConnection();
    await connection.execute(
      'UPDATE support_tickets SET assigned_to = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [adminId, 'assigned', id]
    );
    return this.getTicketById(id);
  }

  async closeTicket(id) {
    const connection = await getDatabaseConnection();
    await connection.execute(
      'UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      ['closed', id]
    );
    return this.getTicketById(id);
  }

  async deleteTicket(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM support_tickets WHERE id = ?', [id]);
  }

  // Messages
  async getMessagesByTicket(ticketId) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT m.*, u.username as sender_name 
       FROM support_messages m 
       LEFT JOIN users u ON m.sender_id = u.id 
       WHERE m.ticket_id = ? 
       ORDER BY m.created_at ASC`,
      [ticketId]
    );
    return rows;
  }

  async createMessage(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO support_messages (ticket_id, sender_id, sender_type, message, is_internal) VALUES (?, ?, ?, ?, ?)',
      [data.ticketId, data.senderId, data.senderType, data.message, data.isInternal || false]
    );
    
    // Update ticket status if user sent a message
    if (data.senderType === 'user') {
      await connection.execute(
        'UPDATE support_tickets SET status = ? WHERE id = ?',
        ['open', data.ticketId]
      );
    }
    
    return result.insertId;
  }

  async updateMessage(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.message) { updates.push('message = ?'); params.push(data.message); }
    if (data.is_internal !== undefined) { updates.push('is_internal = ?'); params.push(data.is_internal); }
    
    if (updates.length === 0) return;
    
    params.push(id);
    await connection.execute(
      `UPDATE support_messages SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  async deleteMessage(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM support_messages WHERE id = ?', [id]);
  }

  // User tickets
  async getUserTickets(userId, status = null) {
    const connection = await getDatabaseConnection();
    let query = `SELECT t.*, u.username as user_name, a.username as assigned_to_name 
                 FROM support_tickets t 
                 LEFT JOIN users u ON t.user_id = u.id 
                 LEFT JOIN users a ON t.assigned_to = a.id 
                 WHERE t.user_id = ?`;
    const params = [userId];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    return rows;
  }

  // Admin functions
  async getUnassignedTickets() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as user_name 
       FROM support_tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.assigned_to IS NULL AND t.status != 'closed' 
       ORDER BY t.created_at ASC`
    );
    return rows;
  }

  async getAssignedTickets(adminId) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT t.*, u.username as user_name 
       FROM support_tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.assigned_to = ? AND t.status != 'closed' 
       ORDER BY t.created_at ASC`,
      [adminId]
    );
    return rows;
  }

  // Stats
  async getStats() {
    const connection = await getDatabaseConnection();
    const [statusStats] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status'
    );
    const [priorityStats] = await connection.execute(
      'SELECT priority, COUNT(*) as count FROM support_tickets GROUP BY priority'
    );
    const [totalStats] = await connection.execute(
      'SELECT COUNT(*) as total FROM support_tickets'
    );
    
    return {
      total: totalStats[0].total,
      open: statusStats.find(s => s.status === 'open')?.count || 0,
      assigned: statusStats.find(s => s.status === 'assigned')?.count || 0,
      in_progress: statusStats.find(s => s.status === 'in_progress')?.count || 0,
      closed: statusStats.find(s => s.status === 'closed')?.count || 0,
      byPriority: priorityStats.reduce((obj, p) => ({ ...obj, [p.priority]: p.count }), {}),
    };
  }

  async getAdminStats(adminId) {
    const connection = await getDatabaseConnection();
    const [assignedStats] = await connection.execute(
      'SELECT COUNT(*) as assigned_count FROM support_tickets WHERE assigned_to = ? AND status != "closed"',
      [adminId]
    );
    const [resolvedStats] = await connection.execute(
      'SELECT COUNT(*) as resolved_count FROM support_tickets WHERE assigned_to = ? AND status = "closed"',
      [adminId]
    );
    
    return {
      assigned: assignedStats[0].assigned_count,
      resolved: resolvedStats[0].resolved_count
    };
  }
}

module.exports = new DatabaseSupportService();
