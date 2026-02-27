const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// 🔥 Nova rota
app.get("/clientes", (req, res) => {
  res.json([{ nome: "Paulo" }]);
});

// Porta do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});