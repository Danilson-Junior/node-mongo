// Importa o Mongoose para trabalhar com MongoDB
const mongoose = require('mongoose');

// Define a estrutura (schema) do modelo 'Client'
const clientSchema = new mongoose.Schema({
  // Campo 'user': referencia o usuário dono deste cliente
  user: {
    type: mongoose.Schema.Types.ObjectId, // Armazena o ID de um documento
    ref: 'User', // Indica que esse ID vem do modelo 'User'
    required: [true, 'Cliente deve pertencer a um usuário.'] // Obrigatório com mensagem personalizada
  },

  // Campo 'name': nome do cliente
  name: {
    type: String,
    required: [true, 'Nome é obrigatório.'], // Não pode ser vazio
    trim: true, // Remove espaços extras no início/fim
    maxlength: [100, 'Nome não pode exceder 100 caracteres.'] // Limite de tamanho
  },

  // Campo 'phone': número de telefone com validação avançada
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório.'],
    validate: {
      // Função que valida o formato do telefone:
      validator: function(v) {
        /**
         * Expressão regular (regex) que valida:
         * - Código do país opcional (+55, +1, etc.) com 1 a 3 dígitos
         * - Hífen ou espaço opcional após o código
         * - Número principal com 10 a 15 dígitos
         * Exemplos válidos: 
         * 11987654321, +5511987654321, 1-2025550123, 44 7911123456
         */
        return /^(\+?\d{1,3}[- ]?)?\d{10,15}$/.test(v); 
      },
      // Mensagem de erro se a validação falhar
      message: 'Telefone inválido. Use 10-15 dígitos com código de país opcional.'
    }
  },

  // Campo 'cpf': número do CPF com validação
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório.'],
    unique: true, // Não permite CPFs duplicados
    validate: {
      // Valida se o CPF tem exatamente 11 dígitos numéricos:
      validator: function(v) {
        return /^\d{11}$/.test(v); // \d significa "qualquer dígito (0-9)"
      },
      message: 'CPF deve conter 11 dígitos numéricos.'
    }
  },

  // Campo 'appointments': lista de agendamentos vinculados
  appointments: [{
    type: mongoose.Schema.Types.ObjectId, // Armazena IDs
    ref: 'Appointment' // Referencia o modelo 'Appointment'
  }]
}, {
  timestamps: true // Adiciona campos 'createdAt' e 'updatedAt' automaticamente
});

/**
 * Índice composto: impede CPF duplicado POR USUÁRIO.
 * - { user: 1, cpf: 1 }: cria um índice que combina os campos 'user' e 'cpf'
 * - unique: true: garante que a combinação user+cpf seja única
 * Exemplo: O usuário A pode ter um cliente com CPF 123, mas o usuário B não pode ter outro 123.
 */
clientSchema.index({ user: 1, cpf: 1 }, { unique: true });

/**
 * Middleware (hook) que executa ANTES de remover um cliente:
 * - Quando um cliente é deletado, remove TODOS seus agendamentos
 * - Evita "lixo" no banco de dados (agendamentos órfãos)
 */
clientSchema.pre('remove', async function(next) {
  // Deleta todos os agendamentos onde 'client' = ID deste cliente sendo removido
  await mongoose.model('Appointment').deleteMany({ client: this._id });
  next(); // Continua o processo de exclusão
});

// Cria o modelo 'Client' baseado no schema definido
const Client = mongoose.model('Client', clientSchema);

// Exporta o modelo para uso em outros arquivos
module.exports = Client;