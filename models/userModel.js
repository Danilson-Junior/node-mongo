// Importa a biblioteca Mongoose para interagir com o MongoDB
const mongoose = require('mongoose');

// Define o schema (estrutura) do modelo User
const userSchema = new mongoose.Schema({
  // Campo 'name': nome do usuário
  name: {
    type: String, // Tipo String
    required: [true, 'Nome é obrigatório.'], // Obrigatório com mensagem personalizada
    trim: true, // Remove espaços em branco no início e fim
    maxlength: [100, 'Nome não pode exceder 100 caracteres.'] // Tamanho máximo
  },

  // Campo 'email': endereço de email do usuário
  email: {
    type: String,
    required: [true, 'Email é obrigatório.'], // Campo obrigatório
    unique: true, // Garante que não haverá emails duplicados
    lowercase: true, // Converte automaticamente para minúsculas
    validate: {
      // Validador customizado usando expressão regular para validar formato de email
      validator: function(v) {
        // Regex que verifica o formato básico de email (ex: usuario@dominio.com)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email inválido.' // Mensagem de erro se a validação falhar
    }
  },

  // Campo 'password': senha do usuário
  password: {
    type: String,
    required: [true, 'Senha é obrigatória.'], // Obrigatório
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres.'], // Tamanho mínimo
    select: false // Não retorna este campo em consultas por padrão (segurança)
  }
}, {
  // Opções adicionais do schema
  timestamps: true // Adiciona automaticamente campos createdAt e updatedAt
});

// Cria o modelo User baseado no schema definido
const User = mongoose.model('User', userSchema);

// Exporta o modelo para ser usado em outros arquivos
module.exports = User;