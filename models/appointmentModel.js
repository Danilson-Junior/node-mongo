const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },  
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: false, // campo opcional
  },
  observations: {
    type: String,
    required: false, // campo opcional
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
