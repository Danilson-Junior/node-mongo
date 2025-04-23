// Importa a biblioteca Mongoose para trabalhar com MongoDB
const mongoose = require('mongoose');

// Define o schema (estrutura) do modelo de Agendamento
const appointmentSchema = new mongoose.Schema({
  // Campo 'user': referencia o usuário responsável pelo agendamento
  user: {
    type: mongoose.Schema.Types.ObjectId, // Armazena o ID de um documento
    ref: 'User', // Indica que esse ID referencia o modelo 'User'
    required: [true, 'Agendamento deve pertencer a um usuário.'], // Obrigatório
    index: true // Cria índice para otimizar consultas por usuário
  },

  // Campo 'client': referencia o cliente vinculado ao agendamento
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Referencia o modelo 'Client'
    required: [true, 'Agendamento deve estar vinculado a um cliente.'],
    index: true // Índice para consultas por cliente
  },

  // Campo 'startDate': data/hora de início com validação
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória.'],
    validate: {
      // Validador customizado: verifica se startDate é anterior a endDate
      validator: function(value) {
        return this.endDate && value < this.endDate;
      },
      message: 'Data de início deve ser anterior à data de término.'
    }
  },

  // Campo 'endDate': data/hora de término
  endDate: {
    type: Date,
    required: [true, 'Data de término é obrigatória.']
  },

  // Campo 'service': descrição do serviço
  service: {
    type: String,
    required: [true, 'Serviço é obrigatório.'],
    trim: true, // Remove espaços extras no início/fim
    maxlength: [100, 'Serviço não pode exceder 100 caracteres.']
  },

  // Campo 'price': valor do serviço
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório.'],
    min: [0, 'Preço não pode ser negativo.'] // Valida valor mínimo
  },

  // Campo 'paymentMethod': forma de pagamento
  paymentMethod: {
    type: String,
    trim: true,
    // Define valores permitidos (enumeração)
    enum: {
      values: ['Dinheiro', 'Cartão', 'PIX', 'Transferência'],
      message: 'Método de pagamento inválido. Use: Dinheiro, Cartão, PIX ou Transferência.'
    }
  },

  // Campo 'observations': informações adicionais
  observations: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem exceder 500 caracteres.']
  }
}, {
  timestamps: true // Adiciona automaticamente createdAt e updatedAt
});

// Cria índice composto para otimizar consultas por usuário + data de início
appointmentSchema.index({ user: 1, startDate: 1 });

// Cria o modelo 'Appointment' baseado no schema
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Exporta o modelo para uso em outros arquivos
module.exports = Appointment;