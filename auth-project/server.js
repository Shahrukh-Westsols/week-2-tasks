const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');       
require('dotenv').config(); 
const authenticateToken = require('./auth/authMiddleware');

const app = express(); 

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,      
  host: process.env.DB_HOST,       
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,      
});

app.locals.pool = pool;

async function dbQuery(text, params) {
  const res = await pool.query(text, params);
  return res;
}

const authRoutes = require('./auth/authRoutes');
app.use('/auth', authRoutes); 

const tasksRoutes = require('./tasks/tasksRoutes');
app.use('/tasks', tasksRoutes);


app.get('/', (req, res) => {
  res.send('Server is running!');
});


// app.get('/tasks', authenticateToken, (req, res) => {
//   res.json({ message: `Hello user ${req.user.email}, this is your tasks.` });
// });


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
