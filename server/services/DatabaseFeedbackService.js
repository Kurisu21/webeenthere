const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseFeedbackService {
  async getAllFeedback(filters = {}) {
    const connection = await getDatabaseConnection();
    let query = 'SELECT f.*, u.username as user_name FROM feedback f LEFT JOIN users u ON f.user_id = u.id WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND f.status = ?';
      params.push(filters.status);
    }
    if (filters.type) {
      query += ' AND f.type = ?';
      params.push(filters.type);
    }
    if (filters.priority) {
      query += ' AND f.priority = ?';
      params.push(filters.priority);
    }
    if (filters.userId) {
      query += ' AND f.user_id = ?';
      params.push(filters.userId);
    }
    
    query += ' ORDER BY f.created_at DESC';
    const [rows] = await connection.execute(query, params);
    return rows;
  }

  async getFeedbackById(id) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT f.*, u.username as user_name FROM feedback f LEFT JOIN users u ON f.user_id = u.id WHERE f.id = ?',
      [id]
    );
    if (rows.length === 0) throw new Error('Feedback not found');
    return rows[0];
  }

  async createFeedback(data) {
    const connection = await getDatabaseConnection();
    const [result] = await connection.execute(
      'INSERT INTO feedback (user_id, type, message, priority) VALUES (?, ?, ?, ?)',
      [data.userId, data.type, data.message, data.priority || 'medium']
    );
    return this.getFeedbackById(result.insertId);
  }

  async updateFeedback(id, data) {
    const connection = await getDatabaseConnection();
    const updates = [];
    const params = [];
    
    if (data.status) { updates.push('status = ?'); params.push(data.status); }
    if (data.assignedTo !== undefined) { updates.push('assigned_to = ?'); params.push(data.assignedTo); }
    if (data.response !== undefined) { updates.push('response = ?'); params.push(data.response); }
    
    if (updates.length === 0) return this.getFeedbackById(id);
    
    params.push(id);
    await connection.execute(
      `UPDATE feedback SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.getFeedbackById(id);
  }

  async deleteFeedback(id) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM feedback WHERE id = ?', [id]);
  }

  async getStats() {
    const connection = await getDatabaseConnection();
    const [statusStats] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM feedback GROUP BY status'
    );
    const [typeStats] = await connection.execute(
      'SELECT type, COUNT(*) as count FROM feedback GROUP BY type'
    );
    const [priorityStats] = await connection.execute(
      'SELECT priority, COUNT(*) as count FROM feedback GROUP BY priority'
    );
    
    return {
      total: statusStats.reduce((sum, s) => sum + s.count, 0),
      open: statusStats.find(s => s.status === 'open')?.count || 0,
      assigned: statusStats.find(s => s.status === 'assigned')?.count || 0,
      responded: statusStats.find(s => s.status === 'responded')?.count || 0,
      closed: statusStats.find(s => s.status === 'closed')?.count || 0,
      byType: typeStats.reduce((obj, t) => ({ ...obj, [t.type]: t.count }), {}),
      byPriority: priorityStats.reduce((obj, p) => ({ ...obj, [p.priority]: p.count }), {}),
    };
  }
}

module.exports = new DatabaseFeedbackService();
