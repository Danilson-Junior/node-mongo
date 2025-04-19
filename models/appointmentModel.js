const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  date: {
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

const Schedule = mongoose.model('Appointment', appointmentSchema);

module.exports = Schedule;
