require('dotenv').config();

const express = require('express');
const app = express();

// Middleware para ler JSON
app.use(express.json());

// Conecta com o MongoDB
require('./config/database');

// Importa e aplica as rotas
const router = require('./routers/index');
router(app);

// Exporta o app para ser usado no server.js
module.exports = app;
