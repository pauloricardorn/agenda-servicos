// Importa o framework Express para criar o servidor
const express = require("express")
// Importa CORS para permitir requisições de outros domínios
const cors = require("cors")
// Importa sqlite3 para manipular o banco de dados SQLite
const sqlite3 = require("sqlite3").verbose()

// Cria uma instância do Express
const app = express()

// Habilita CORS (permite que front-end acesse a API)
app.use(cors())
// Permite que o Express interprete JSON no corpo das requisições
app.use(express.json())
// Serve arquivos estáticos da pasta atual (ex.: index.html, JS, CSS)
app.use(express.static(__dirname))

// Cria ou abre o banco de dados "agenda.db"
const db = new sqlite3.Database("agenda.db")

// Cria a tabela "agendamentos" se não existir
db.run(`
CREATE TABLE IF NOT EXISTS agendamentos(
    id INTEGER PRIMARY KEY AUTOINCREMENT, // ID auto-incrementável
    cliente TEXT,                         // Nome do cliente
    telefone TEXT,                        // Telefone
    endereco TEXT,                        // Endereço
    local TEXT,                           // Local do serviço
    data TEXT,                            // Data do agendamento
    hora TEXT,                            // Hora do agendamento
    servico TEXT,                         // Serviço agendado
    status TEXT,                           // Status (Pendente, Em Andamento, Concluído)
    obs TEXT                               // Observações adicionais
)
`)

// Rota GET para listar todos os agendamentos
app.get("/agendamentos", (req, res) => {

    // Consulta todos os registros ordenando por data e hora
    db.all(
        "SELECT * FROM agendamentos ORDER BY data,hora",
        [],
        (err, rows) => {
            if(err) return res.status(500).json(err) // Retorna erro 500 se houver
            res.json(rows) // Retorna os registros em JSON
        }
    )

})

// Rota POST para criar um novo agendamento
app.post("/agendamentos", (req, res) => {
    const a = req.body // Recebe os dados do agendamento do front-end

    // Insere no banco de dados
    db.run(
        `INSERT INTO agendamentos
        (cliente,telefone,endereco,local,data,hora,servico,status,obs)
        VALUES (?,?,?,?,?,?,?,?,?)`,
        [
            a.cliente,
            a.telefone,
            a.endereco,
            a.local,
            a.data,
            a.hora,
            a.servico,
            a.status,
            a.obs
        ],
        function(err) {
            if(err) return res.status(500).json(err) // Erro 500 se falhar
            res.json({id: this.lastID}) // Retorna o ID do agendamento criado
        }
    )
})

// Rota PUT para atualizar o status de um agendamento
app.put("/agendamentos/:id", (req, res) => {
    db.run(
        "UPDATE agendamentos SET status=? WHERE id=?",
        [req.body.status, req.params.id],
        err => {
            if(err) return res.status(500).json(err) // Retorna erro se falhar
            res.json({ok:true}) // Confirma sucesso
        }
    )
})

// Rota DELETE para excluir um agendamento
app.delete("/agendamentos/:id", (req, res) => {
    db.run(
        "DELETE FROM agendamentos WHERE id=?",
        [req.params.id],
        err => {
            if(err) return res.status(500).json(err) // Retorna erro se falhar
            res.json({ok:true}) // Confirma exclusão
        }
    )
})

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000")
})
