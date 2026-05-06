const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_notes (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, customer_name, email, notes, created_at FROM customer_notes ORDER BY id DESC"
    );

    const rows = result.rows.map(row => `
      <tr>
        <td>${row.id}</td>
        <td>${row.customer_name}</td>
        <td>${row.email || ""}</td>
        <td>${row.notes || ""}</td>
        <td>${row.created_at}</td>
        <td>
          <form method="POST" action="/delete/${row.id}">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>
    `).join("");

    res.send(`
      <html>
      <head>
        <title>Customer Notes App</title>
        <style>
          body { font-family: Arial; margin: 40px; }
          input, textarea { width: 350px; margin: 5px; padding: 8px; }
          button { padding: 8px 14px; margin: 5px; }
          table { border-collapse: collapse; margin-top: 25px; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Customer Notes App</h1>
        <p>Node.js application running on VM-Lab and connected to Cloud SQL PostgreSQL.</p>

        <form method="POST" action="/add">
          <div><input name="customer_name" placeholder="Customer Name" required /></div>
          <div><input name="email" placeholder="Email" /></div>
          <div><textarea name="notes" placeholder="Notes"></textarea></div>
          <button type="submit">Save Customer Note</button>
        </form>

        <h2>Saved Records from PostgreSQL</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Notes</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
          ${rows}
        </table>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});

app.post("/add", async (req, res) => {
  const { customer_name, email, notes } = req.body;

  try {
    await pool.query(
      "INSERT INTO customer_notes (customer_name, email, notes) VALUES ($1, $2, $3)",
      [customer_name, email, notes]
    );
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Insert failed: " + err.message);
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM customer_notes WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Delete failed: " + err.message);
  }
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Customer Notes App running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
