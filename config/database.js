const mongoose = require('mongoose');

require('dotenv').config(); // Carrega variáveis de ambiente

// URL de conexão com o MongoDB
const url = process.env.MONGO_URL;

// Função assíncrona para conectar ao MongoDB
const connectToDatabase = async () => {
  try {
    // Conecta ao MongoDB sem as opções depreciadas
    await mongoose.connect(url);

    // Se a conexão for bem-sucedida, exibe a mensagem
    console.log('Conexão com o MongoDB estabelecida com sucesso!');
  } catch (error) {
    // Se ocorrer um erro, exibe a mensagem de erro
    console.error('Erro de conexão com o MongoDB:', error);
  }
};

// Chama a função para conectar ao banco de dados
connectToDatabase();
