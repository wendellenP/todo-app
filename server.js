const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

// Serve CSS and JavaScript files
app.use(express.static(path.join(__dirname, 'public')));

// Display the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Add a task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;

        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ error: 'Task title is required' });
        }

        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Update task completion
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { completed } = req.body;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Invalid completed value' });
        }

        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
