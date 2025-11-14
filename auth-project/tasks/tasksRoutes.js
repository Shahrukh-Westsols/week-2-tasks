const express = require('express');
const router = express.Router();
const authenticateToken = require('../auth/authMiddleware');

router.post('/', authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await req.app.locals.pool.query(
      'INSERT INTO tasks(title, description, owner_id) VALUES($1, $2, $3) RETURNING *',
      [title, description || '', req.user.id]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'SELECT * FROM tasks WHERE owner_id = $1',
      [req.user.id] 
    );

    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    const result = await req.app.locals.pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, completed = $3
       WHERE id = $4 AND owner_id = $5
       RETURNING *`,
      [title, description, completed, id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'You are not allowed to update this task' });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await req.app.locals.pool.query(
      'DELETE FROM tasks WHERE id = $1 AND owner_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'You are not allowed to delete this task' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/completed', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (completed === undefined) {
    return res.status(400).json({ error: '`completed` field is required' });
  }

  try {
    const result = await req.app.locals.pool.query(
      `UPDATE tasks
       SET completed = $1
       WHERE id = $2 AND owner_id = $3
       RETURNING *`,
      [completed, id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'You are not allowed to update this task' });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
