const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database("./agenda.db");

// Criar tabela se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT,
            endereco TEXT,
            local TEXT,
            data TEXT,
            hora TEXT,
            servico TEXT,
            status TEXT
        )
    `);
});

// ================= ROTAS =================

// Listar agendamentos
app.get("/agendamentos", (req, res) => {
    db.all("SELECT * FROM agendamentos ORDER BY data, hora", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar agendamentos" });
        }
        res.json(rows);
    });
});

// Criar agendamento
app.post("/agendamentos", (req, res) => {
    const { cliente, endereco, local, data, hora, servico, status } = req.body;

    db.run(
        `INSERT INTO agendamentos (cliente, endereco, local, data, hora, servico, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cliente, endereco, local, data, hora, servico, status],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao criar agendamento" });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Atualizar agendamento
app.put("/agendamentos/:id", (req, res) => {
    const { cliente, endereco, local, data, hora, servico, status } = req.body;

    db.run(
        `UPDATE agendamentos
         SET cliente=?, endereco=?, local=?, data=?, hora=?, servico=?, status=?
         WHERE id=?`,
        [cliente, endereco, local, data, hora, servico, status, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao atualizar agendamento" });
            }
            res.json({ updated: this.changes });
        }
    );
});

// Deletar agendamento
app.delete("/agendamentos/:id", (req, res) => {
    db.run(
        "DELETE FROM agendamentos WHERE id=?",
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao deletar agendamento" });
            }
            res.json({ deleted: this.changes });
        }
    );
});

// ================= SERVIDOR =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});