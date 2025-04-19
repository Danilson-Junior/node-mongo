const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cpf: {
    type: String,
    required: true,
    unique: true, // ensures the CPF is unique
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment', // referenciando o modelo de agendamentos
    },
  ],
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
