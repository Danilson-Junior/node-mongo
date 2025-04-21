require('dotenv').config();

const app = require('./app'); // Importa o app configurado
const port = process.env.PORT || 3000;

// Inicia o servidor
app.listen(port, (error) => {
  if (error) {
    console.log('Erro ao iniciar o servidor:', error);
    return;
  }
  console.log(`Servidor rodando na porta ${port}`);
});
